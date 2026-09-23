# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

「でじこんちゃん.net」- 東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュ「でじこんちゃん」とチャットできるWebアプリケーション。Gemini APIによるAIチャット機能と、感情表現アニメーションを備える。

## 開発コマンド

```bash
pnpm dev          # 開発サーバー起動 (localhost:3000, Turbopack使用)
pnpm build        # 本番ビルド
pnpm start        # 本番サーバー起動
pnpm lint         # ESLint実行 (app/ components/ lib/ 対象)
pnpm test         # 単体テスト (node:test + 型ストリップ。Node 24 必須、依存追加なし)
```

テストは `lib/**/*.test.ts` に置き、import は `./chat-request.ts` のように拡張子まで書く（`tsconfig.json` の `allowImportingTsExtensions` で許可済み）。Node はパスエイリアス `@/` を解決できないため、テスト対象のモジュールは `@/` を import しない。npm パッケージ（`openai` など）は Node がそのまま解決できるので import してよい。ただし型しか持たないもの（`ClientOptions` など）は `import type` で書く。通常の import のままだと、Node が実行時に存在しない export を探して失敗する。

Gemini の上流呼び出しは、本物の SDK クライアントの fetch だけを `createGeminiClient(key).withOptions({ fetch })` で差し替えてテストする（`lib/gemini-client.test.ts`）。上流への試行回数を fetch の呼び出し回数として直接数えられる。

パッケージマネージャは **pnpm** を使用（`.npmrc` で `node-linker=hoisted` 設定済み）。

## 技術スタック

- **Next.js 16.3** (App Router + Turbopack)。`<Link transitionTypes>` を使うため 16.1.6 から上げた（#42）。このプロップは 16.2 で入ったもの
- **React 19**
- **TypeScript** (strict mode, パスエイリアス `@/*` → `./`)
- **Gemini API** - OpenAI SDK (`openai` パッケージ) 経由で `generativelanguage.googleapis.com` に接続
- **GSAP** + **framer-motion** - アニメーション
- **Sass** (SCSS Modules) - スタイリング
- **@svgr/webpack** - SVGをReactコンポーネントとしてインポート
- **View Transitions API** - ルートレイアウトの `<ViewTransition>` が遷移を起こし、演出対象には `view-transition-name` を振る（`styles/globals.css`）。`next.config.ts` の設定は不要（`experimental.viewTransition` は no-op なので #32 で削除した）。遷移の種別は `<Link transitionTypes>` で渡し、CSS の `:active-view-transition-type()` で受ける（#42）
  - `ViewTransition` は `react@19.2.4` 本体には無い。App Router が `react` を Next.js の同梱ビルド（`next/dist/compiled/react`）へ解決するので使えている。型は `next/dist/types.d.ts` の `/// <reference types="react/experimental" />` 経由で届く

## アーキテクチャ

### ページ構成

| パス | 内容 |
|------|------|
| `/` | ホームページ（リンク集、キャラクター表示） |
| `/about` | でじこんちゃんプロフィール・タイムライン・ギャラリー |
| `/chat` | AIチャットUI |
| （404） | `app/not-found.tsx`。存在しないURLで出る |

### チャット機能のデータフロー

```
ChatPage (状態管理: messages, emotion, error)
  → ChatWindow (入力・メッセージ表示)
    → POST /api/gemini (messages配列を送信)
      → Gemini API (OpenAI互換エンドポイント)
      → describeEmotionHeader (遵守率の計測のみ。応答は変えない)
    → parseEmotionResponse (レスポンス1文字目から感情を抽出)
  → ChatCharacter (感情に応じた画像切り替え)
```

### 感情表現システム

APIレスポンスの1文字目で感情を判定する。判定は `lib/emotion.ts` の `parseEmotionResponse` 1か所だけで行い、サーバー（計測）とクライアント（立ち絵の切り替え）で共有する。別々に判定するとログの数字と画面の挙動がずれる（#26）。

- `楽` `怒` `哀` `困` `照` → 対応する感情画像に切り替え（7秒後にdefaultへ戻る）
- 1文字目がどれでもなければ `default`。「フォーマットが崩れた」場合と「感情が付かなかった」場合の両方を含み、区別はしない

`/api/gemini` は返却の直前に、判定結果を `Emotion header: <感情>` として本番でも記録する（`lib/emotion.ts` の `describeEmotionHeader`）。利用者の入力も返答の本文も残さない。記録されるのは次の形だけ。

| 記録 | 意味 | 画面 |
|---|---|---|
| `楽` | 整った返答 | 楽の立ち絵 |
| `楽 (empty body)` | 感情はあるが本文が空 | **困の立ち絵**。`fail` がエラー表示に切り替える |
| `default (no emotion char in line 1)` | 1行目に感情の一文字が無い | default の立ち絵 |
| `default (emotion char at 2)` | 感情はあるが前に2文字付いている（例: `**楽`） | default の立ち絵 |

**`default` の割合は「立ち絵が切り替わらなかった割合」と等しくない。** 本文が空の返答は、感情が取れていても画面では `困` になる（`components/chat-page.tsx` の `fail`）。立ち絵の実態を知るには `(empty body)` の付いた行を別に数える。

`default (emotion char at N)` が多いなら、解析を緩めれば拾える崩れ方だと分かる。`no emotion char in line 1` が多いなら、モデルがそもそも感情を書いていない。再デプロイせずに切り分けられる。

```bash
# Hobby の本番ランタイムログは1時間しか残らない。--since はそれより長くしても意味が無い
vercel logs --project dcchan --scope yamashitamanato --environment production --no-branch --since 1h --json \
  | jq -r 'select((.message // "") | startswith("Emotion header: ")) | .message | sub("^Emotion header: "; "") | sub(" \\(.*\\)$"; "")' \
  | sort | uniq -c | sort -rn
```

> **ログの保持期間に注意。** Vercel のランタイムログは Hobby で **1時間**（Pro 1日 / Enterprise 3日 / Observability Plus 30日）。
> 数日ぶんを溜めて一度に集計することはできない。期間を伸ばすには Log Drain を入れるか、保持期間の内側で定期的に採取して自分で足し込む。

感情判定の方式を変えるときは、まずこの数字を見る。崩れが観測されないなら、置き換えても勝ち目が無い（#26 に n=30 の実測がある）。

### APIルート (`app/api/gemini/route.ts`)

- Gemini 2.5 Flash モデル使用。thinking は `reasoning_effort: "none"` で切ってある（#17）
  - 有効だと長めの応答が 11 秒を超え、関数上限 10 秒に収まらない。切ると応答は 1〜3 秒で、感情の一文字やキャラクター設定の遵守は変わらない
  - 2.5 Pro と Gemini 3 系は thinking を切れない。モデルを移行するときは `"minimal"` で応答時間とフォーマットを測り直す
- レート制限は `lib/rate-limit.ts`（#33）。上流への試行ごとに記録し、枠が尽きたら再試行もしない
  - **このキーは有料ティア**。120リクエストの同時投入がすべて通る（約4,000 RPM 相当）ことを実測済み。以前の「無料枠 10RPM だから 8 RPM」という前提は誤りで、守るべきものは上流の枠ではなく**請求**
  - **分あたり 60**（同時に触る人数の上限。イベントで一斉に使われても詰まらない）と**1日あたり 3,000**（請求の歯止め）の2つの窓を持つ。分だけでは、低い速度で回し続けられると青天井になる
  - インメモリなので Vercel の関数インスタンスごとに別々に数える。**厳密な保証ではなく歯止め**。インスタンスが N 個立てば実効の上限は 3,000 × N になる。**請求に硬い上限を掛けられるのは Google Cloud 側の割り当てと予算アラートだけ**で、アプリ側では引けない（#36）
  - `Retry-After` は最も古い記録が窓から外れるまでの秒数を返す。固定値ではない
  - **画面に出すときは `describeRetryAfter` で単位を丸める。** 秒のまま出すと、1日の上限に当たったときに「86340秒くらい待ってから」になる。そもそもインスタンスごとの数え方なので、秒の精度に意味は無い
- **返答の長さはおおむね200字を目安**にさせている（#33）。「200字以内」と硬く決めると短い返答まで痩せるので、目安にとどめる
  - **返答の長さは大きくばらつく。平均だけで判断しないこと。** 本番実測（`2061081`、n=6）で、長い質問（「DTMを始める手順を最初から詳しく教えて」）への返答は**平均624字・最大1118字**。ローカルで測った「348字・最大446字」は本番で再現しなかった（#44）
  - 短い質問（「こんにちは！」）への返答は本番で**平均70字**（n=3）。ローカルの 111字 とは違い、目安を付ける前の 105字 から痩せている
  - コスト削減は概ね **-33%**（長い質問で 929字 → 624字）。**方向は正しいが、字数の内訳はローカルの計測と一致しない**
  - **コストは出力が支配的**（出力 $2.50/Mtok に対し入力 $0.30/Mtok）。削るなら出力を削る
  - **ここへ数値を書くときは n と計測環境（本番／ローカル）を必ず併記する。** n が小さいまま断定すると、次のモデル移行で誤った基準になる（#44 がその実例）
- 上流の呼び出しは `lib/gemini-client.ts` に集約している（#13）
  - SDK の自動リトライは `maxRetries: 0` で止めてあり、再試行は `withRetry` だけが行う。SDK 側と二重にすると、1回の送信で上流を最大9回呼ぶ
  - 再試行するのは 429/503 だけで、エクスポネンシャルバックオフで最大2回
  - 試行とバックオフを合わせて 9 秒で打ち切る（`UPSTREAM_DEADLINE_MS`）。各試行には残り時間を SDK の `timeout` として渡し、残りが 4 秒を切ったら再試行しない
- システムプロンプトにキャラクター設定を埋め込み。返答はプレーンテキストで表示するので、Markdown 記法を使わず、箇条書きは「・」で書くよう指示している（#20）
- 入力検証（`lib/chat-request.ts` の `parseChatRequest`）。不正なリクエストは Gemini を呼ぶ前に 400 で返すので、レート制限の枠を消費しない
  - role は `user` / `bot` だけを受け付け、`bot` は `assistant` に正規化する。`system` などを通すとキャラクター設定を上書きされる（#14）
  - `content` は空でない文字列のみ。user は 1000 字を超えたら 400、bot 履歴は 4000 字で切り詰める
  - 件数は最大9件（user は5件まで）で、末尾は必ず user

### セッション制限

チャットは最大5メッセージまで送信可能。その後リセットが必要。送信は Cmd+Enter (Mac) / Ctrl+Enter (Windows)。上限値（`MAX_PROMPTS` など）は `lib/chat-request.ts` でクライアントとサーバーが共有し、サーバー側でも強制している。

送信に失敗したとき（429、通信エラー、504、本文が空の返答）は、発言を履歴から外して入力欄へ戻す。回数は減らず、エラー文言も Gemini へ送り返さない。エラーは履歴の外に `error` として持ち、「入力欄に戻したので、もう一度送って」という案内を添えて表示する。`route.ts` のエラー文言には何が起きたかだけを書く。

### `/`（トップ）の短尺対応（#56）

`app/page.module.scss` の `.back` は `height: 100svb` の flex column で、中は3行。

- `.row`(33%) と `.row2`(20%) は `overflow: hidden` を持つため flex の automatic minimum size
  が 0 になり、**縦が足りないと無音で 0px まで潰れる**。行の高さの合計は、幅≤768 で
  `H − 438`（= `23rem` + `.back` の `padding-bottom: 70px`）に線形で乗る。つまり
  **H ≤ 438 の間は 0px** で、その上も細い切れ端が続く（H=480 で 26 / 16px、553 で 72 / 43px、
  600 で 101 / 61px）。幅>768 は H=385 で 19 / 11px、480 で 78 / 47px（崖は外挿で約 355。
  24rem の下なので 0px は観測されない）。**#60 の Issue が書いた崖 454 / 384 は計算値で、
  実測とは 16px ずれていた**（本番ビルド、n=1）
- **行が 0px でも、`.sounds` は見えている。** `position: absolute; top: auto` で、包含ブロックは
  `.back`。`.row2` は `position: static` なので、`.row2` の `overflow: hidden` に切られない。
  640×400 でも ver1.0〜3.0 の 3 ボタンは画面にあり、押せる（`elementFromPoint` で確認）。
  縦位置は `top: auto` のため `.row2` の中央から決まる。`.row` を `display: none` にすると、行の高さと
  上の margin・gap のぶん上へ動き（CSS 注入で実測。640×400 で 32px、1280×480 で 85px）、
  `.row2` を `display: none` にすると消える。
  **見えていないのは Music・Card・Toggle・ロゴだけ**（#60 の Issue 本文は Sounds も含めていたが誤り）
- 潰れきると残るのは `.row3`（`.sidebar` + `.hello`）だけで、その高さは `.navbar` の
  min-content = **272px**（リンク7本 × `$linkHeight` 2rem + 縦 padding 3rem）で固定される。
  ここは縮まない
- 最下端は `.hello .desu`。`<span>` はインラインなので `getBoundingClientRect()` は
  行ボックス（`line-height: 1` の 16px）ではなく ascent+descent（Nunito で約21.8px）を返し、
  3px 下へ出る
- **はみ出しの最下端は `.hello .desu` の bottom で決まり、`.desu` の font-size が
  幅で3段階に変わるので崖も3段階になる。** ビューポート高さがこれを下回ると溢れる。
  `.back` の `padding-bottom: 70px` は `.back` 自身の border box（100svb）の内側にあるので、
  はみ出した子孫はそれを突き抜ける。**padding-bottom ははみ出し量に効かない**

  | 幅 | `.desu` の font-size | `.desu` の bottom | `scrollHeight - clientHeight` が 0 になる最小の高さ |
  |---|---|---|---|
  | ≤540 | 1rem | 355.0 | **355px** |
  | 541〜768 | 1.5rem | 356.0 | **356px** |
  | >768 | 2rem | 344.2 | **344px** |

  本番ビルドに対し、`@media (max-height: 24rem)` の `CSSMediaRule` を実行時に削除して
  修正前を再現し、320 / 540 / 541 / 640 / 768 / 769 / 1280 の7幅で 1px 刻みに走査した値
  （n=1、2セッションで独立に一致）。**ブレークポイントの境界ちょうど（540/541、768/769）まで
  測らないと、代表値1つで一般化して 1px ずれる。**

`@media screen and (max-height: 24rem)` でコンパクト表示へ切り替える。
`.row` / `.row2` を落とし、`.row3` を縦積みにし、リンクを横並びの折り返しにし、
`.hello` の挨拶バブルを落とす。**リンクの当たり判定 64×32 は変えない。**

- **3ファイルとも追記はファイルの末尾に置く。** `@media` はカスケードに影響せず、
  同詳細度ならソース順の後勝ちで決まる。`.hello .title` は `max-width: 540px` 版と
  同じ (0,2,0) なので、後ろに `max-width` のブロックを足すと負ける
- **ナビの横並びに `grid` の `repeat(auto-fit, …)` は使えない。** コンテナのサイズが不定
  （`width: fit-content` の max-content 計算中）のとき `auto-fit` は繰り返し1回に解決され、
  1列7行へ戻る（CSS Grid 仕様 7.2.3.2）。`flex-wrap` にはこの罠が無い
- **ツールチップはナビの真下に出す。** デスクトップ分岐では `.row3` が上寄せでナビが
  画面上端に来るので、真上に出すと 1280×300 で `top: -12px` になり7本すべてが画面外へ出る
- **`.navbar_item:last-child::before` のゼリー状の指標は `content: none` で止める。**
  `@for` の生成規則は `top` / `animation` / `opacity` しか書いておらず `content` には
  触れないので、同詳細度 (0,2,1) の後勝ちで消える。`!important` は要らない
- **閾値の単位は `rem`。`px` で固定してはいけない。** `Page.setFontSizes` で既定フォントを
  20px にすると、閾値は 480px（24rem）へ、ナビの縦並びの高さは 340px（17rem）へ**連動して動く**。
  `px` 固定だと文字サイズを上げた利用者では崖が閾値を追い越し、救えなくなる（実測で確認）
- **極小サイズでは Music・Card・Toggle・ロゴ・Sounds を意図的に落としている。**
  WCAG 1.4.10 は 320×256 へのリフローで情報と機能を失わないことを求めるが、
  `body { overflow: hidden }` と `.back { height: 100svb }` がスクロールという解法を
  自ら封じている。`styles/not-found.module.scss` と `styles/chat-window.module.scss` の
  `@media (max-height: 20rem)` と同じ「飾りより導線を優先する」判断

`@media screen and (max-height: 30rem)` は別の規則で、`.row` と `.row2 .r2_column`（Music・Card・
Toggle・ロゴ）を **`visibility: hidden`** にする（#60）。潰れて見えないのに Tab が当たる操作子を、
Tab 順と読み上げから外すための規則。

- **`display: none` にしない。レイアウトが 1px も動かない。** 幅 10 種 × 高さ 72 種の 720 点で
  `#home` 以下の全要素の矩形が修正前と一致した（本番ビルド、`prefers-reduced-motion: reduce`、n=1）。
  H=385〜389 の 41 点だけ、走査の待ち時間が 90ms だと、圧縮から非圧縮へ切り替わった直後の値が
  落ち着く前に読んでハッシュが揺れた。ここは待ち時間を 600ms にし、同じビルドから 30rem のルールを
  実行時に削除した状態と突き合わせ直した（H=376〜392 × 10 幅の 170 点）。差は 0 だった。
  **高さを連続で変えながら測るときは、切替の直後の数点を待ち時間を延ばして測り直す**
- **`.row2` 自身は隠さない。** Sounds を残すため。`.row` と `.row2` を丸ごと落とすと、
  640×400 で見えて押せる Sounds が消える
- **24rem のブロックとは別の現象を救っている。** こちらは「見えないのにフォーカスされる」、
  24rem 側は「縦に溢れる」。挨拶バブルの非表示やナビの縦積みまで 30rem へ巻き込むと、
  385〜480px の端末（iPhone 横向きなど）から必要のない圧縮を掛けることになる。24rem 以下では
  24rem 側の `display: none` が行ごと落とす
- **閾値は崖の上に余裕を持たせた 30rem。** 幅≤768 の崖 438px（23rem + 70px）に対し、既定で 42px
  の余裕。`rem` なので文字サイズに追従する（`Page.setFontSizes` で 20px にすると 600px で切り替わる）。
  境界は 10 幅（320〜1280）すべてで 480 = 隠す / 481 = 出す
- 効果: 640×400 / 844×390 / 1280×450 / 640×460 の Tab 一巡は **17 → 14 停止**。行内の停止は
  6 → 3（Sounds の 3 ボタンだけ。3 つとも `elementFromPoint` で到達可）。844×390 で上端に見えていた
  Music と Card の白い切れ端は消える
- **480px の直上にも切れ端は残る**（幅≤768 で 481px の行は 27 / 16px、390×553 では 72 / 43px）。
  「0 ではないが使えない」帯は閾値をどこに置いても直上に生じる。ここは #60 の範囲外
- `visibility: hidden` の行の中で鳴っている音は、#65 で止めるようにした（下記「行に触れなくなったときの再生」）。
  それまでは `display: none` の #56 から、再生中に行が隠れると停止する操作が無くなっていた

### 行の中身を行の高さに追従させる（#64）

**#60 の直上に残っていた「表示はされているが実用にならない」帯を、閾値ではなく中身の側で閉じた。**
`.row` の高さは `0.6226 × (H − 崖)`（0.6226 = 33/(33+20)）で縮むのに、Music と Card は自分の
自然な高さを主張する。`.row` の `overflow: hidden` は**縮小ではなく切り取り**なので、行が足りない
あいだ操作子が消える。本番ビルドの実測（n=1、`reduce`）で、シークバーが見えるのは
**1280×700 / 768×800 / 390×800 から上だけ**だった。Issue #64 が書いた「481〜650px 程度」は
過小評価で、実際は 800px 近くまで壊れていた。

- **高さの分岐は `@media` ではなく `@container` で書く。** 行の高さを viewport から再導出すると
  必ず外す（#56 は崖を 454px と計算したが実測は 438px）。`container-type: size` を `.music` と
  `.card` に置き、**実際に与えられた高さ**を引く
  - **`container-type: size` を `.row2` に置いてはいけない。** `contain: layout` を含むので絶対配置の
    子孫の包含ブロックになり、`.sounds`（`position: absolute; top: auto` で包含ブロックが `.back`）の
    縦位置が変わる。`.music` / `.card` の中の絶対配置（`.card__overlay` と `.card__image` は
    `.container`、`.card__arc` は `.card__header`、`.pl` / `.pa` / `input` は `.play_container`）は
    いずれも内側に `position: relative` を持つので影響しない
  - **`@container` ブロックは既存の `@media` より後ろに置く。「1 段深くしたから勝てる」ではない。**
    `@media (max-width: 480px)` の中は `.music .player .infoWrapper .img`(0,4,0) まで深く、
    `@container` 側の `.music .player .wrapper .img` も**同じ (0,4,0)**。ここを決めているのは
    詳細度ではなく**ソース順の後勝ち**なので、ブロックをファイル末尾から動かすと崩れる。
    詳細度で勝っているのは `.info .h1`(0,5,0 対 `.music .player .infoWrapper .info h1` の 0,4,1) と
    `.trackTime .time`(0,5,0 対 0,4,0) だけ。**ビルド後の CSS でクラス数を数えて確かめる**
- **このリポジトリに全体の `box-sizing: border-box` は無い**（`styles/` と `app/` に個別指定が 4 箇所
  あるだけ）。`.player` は `height: 100%` + `padding: 2rem` で border box が親より **64px 高く**、
  角丸の下端が 1280×800 でも切れていた。`box-sizing: border-box` を足しても**中身の位置は動かない**
  （content は上 padding から始まるまま）。下端の角丸が出るだけ
- **`.card` の `.container` が `height: 33vh` 固定だった。** 行の高さと無関係なので常に切られ、
  390×844 でも画像の 9%、1280×600 では 23% が欠けていた。`height: 100%` にすると行にぴったり収まる
- 閾値は中身の**自然高さの実測**から決める。player の上端から最も深い要素の下端までは
  **216.6px**（幅>480、`.time` の下端）/ **209.8px**（幅≤480、シークバーの下端）。
  オーバーレイは幅 320〜1600 で振って最大 **192px**（幅 621〜768）。それぞれに数 px の余裕を足して
  `14rem` / `12.5rem` にした。**Card 側は #67 で字幕を折り返させたため、最大 212.8px になり `14rem` へ上げた**
  （下記「Card ヘッダーの横の切れ」）
- 圧縮後の自然高さは Music・Card とも **64px**。行が 64px に達するのは幅≤768 で H ≈ 541px なので、
  `visibility: hidden` の閾値は幅≤768 だけ 30rem → **34rem** へ上げた。幅>768 は崖が 355px で
  481px でも行が 78.3px あるため **30rem のまま**
  - **境界が幅で 2 本に分かれた**（1px 走査 1110 点で確認）: 幅≤768 は **544 = 隠す / 545 = 出す**、
    幅>768 は **480 / 481**。#60 の「10 幅すべてで 480/481」は #64 以降は成り立たない
  - どちらの境界でも、**出た瞬間からジャケット・Play/Pause・シークバー・Card 画像が完全に見え、
    `elementFromPoint` で到達できる**
- 効果（幅 10 種 × 高さ 14 種の 140 点）: 骨格（`.row` / `.row2` / `.row3` / `.sounds` / `.music` /
  `.card`）の矩形は**全点で修正前と一致**し、違うのは `visibility` だけ（幅≤768 の H=481/500/544 の
  24 点）。縦の溢れは全点 0。行が見えている点で**部分的に欠ける要素は 0**（修正前はジャケット 35 点 /
  Play 8 点 / Card 画像 94 点 / 説明文 34 点）
- **Tab 一巡は #60 の数字を崩していない。** 640×400 / 844×390 / 1280×450 / 640×460 は 14 停止、
  320×256 / 1280×300 は 11 停止で不変。390×500 は **17 → 14 停止**（見えないシークバーと
  Play/Pause と Card のリンクが Tab から外れる）

**この Issue の範囲外として切り出し、#67 / #68 / #69 で解決したもの**（下記「Card ヘッダーの
横の切れ」「Play/Pause の回転」「行に触れなくなったときの再生」を参照）。

**計測するときの注意:**

- **「見えているか」は矩形の高さではなく `elementFromPoint` で測る。** 行が 0px でも、絶対配置の
  `.sounds` は `overflow: hidden` に切られず見えている。行の高さだけで「全部見えていない」と
  結論すると誤る（#60 の Issue 本文がそうだった）。要素の中心で `document.elementFromPoint(cx, cy)` を引き、
  返ったものが要素自身かその子孫なら、画面にあって押せる。Tab の停止ごとに読むと「行内の停止 6 のうち
  到達不可 3（Music の 2 つと Card のリンク）」と数えられる。**Issue や CLAUDE.md の計算値も、
  1 点は実測で確かめる。** 崖 454 は実測 438 だった
- **`.navbar_link` は `transition: all .25s`。`focus()` の直後に computed style を読むと
  開始値（`opacity: 0`、静止位置の transform、`background: rgba(0,0,0,0)`）が返る。**
  300ms 以上待ってから読む。待たずに読むと「フォーカス演出が効いていない」という
  誤った結論になる。実画素（`Page.captureScreenshot` + `sharp`）で裏を取れる
- 確認する画面サイズは /chat と同じ4つ（1280×800 / 640×400 / 390×844 / 320×256）に
  **1280×300 を加える**。横長短尺はデスクトップ分岐に入るため、モバイル幅だけ見ていると
  見つからない（#56 では 44px 溢れていた）
- **「欠けているか」は矩形ではなく、祖先の `overflow` と viewport で切った後に残る面積の割合で測る。**
  `getBoundingClientRect()` は切り取られても元の大きさを返すので、高さだけ見ても欠けに気付けない。
  祖先を遡って `overflow` が `visible` でない箱の矩形と交差させ、`(残った面積 / 元の面積)` を出す。
  1 なら無傷、0 より大きく 1 未満なら**部分的に欠けている**（これが #64 で探していたもの）、
  0 なら完全に隠れている
- **Play/Pause の `<input type="checkbox">` は `position: absolute; opacity: 0; width/height: 0` なので、
  Tab の停止を `elementFromPoint` で数えると必ず「到達不可」に出る。** 見えているのは `<label>` の
  中の svg で、押せる。修正前後で同じなので退行ではない。この 1 件は除いて数える
- **`@keyframes keyframes-fill` が走っているあいだ、Play アイコンの矩形は 24〜32px で揺れる。**
  0.5 秒の一度きりのアニメなので、待ち時間が短いと途中値を読む。可視率は変わらないので、
  高さの端数が出たらこれを疑う
- 本番ビルドに対して測る。`document.scrollingElement.scrollHeight - clientHeight` と、
  `scrollTop = 9999` の書き戻しの2通りで見る。**Tab 一巡では最終値ではなく最大値を読む**。
  一巡すると 0 へ戻るので、最終値だけでは「問題なし」に見える
- **本番をブラウザで測るときは、Google Analytics への通信を遮断する。** 本番の HTML には
  `gtag/js` と `ga-init` が載っている（`app/layout.tsx`。`NEXT_PUBLIC_GA_MEASUREMENT_ID` があるとき）。
  計測用の Chrome を開くだけで GA のスクリプトが走り、たとえば 11 サイズ × 2 通り
  （`no-preference` / `reduce`）を測れば 22 回の読み込みが閲覧数に混ざる恐れがある。
  CDP では `Network.enable` の後、**最初のナビゲーションより前に** `Network.setBlockedURLs` で
  `*googletagmanager.com*` `*google-analytics.com*` `*analytics.google.com*` を止める
  - 本番で確認済み（#56）: `gtag/js` への 2 リクエストとも `blockedReason=inspector` で失敗した。
    `gtag()` は関数として定義されるが、ライブラリ本体が読まれないので、`dataLayer` に積まれた
    設定が送信されることはない
  - **遮断なしで読み込んで「遮断が要るか」を確かめてはいけない。** 本番の GA に閲覧を送ってしまう
- **GSAP が走る `no-preference` の幾何は、最初の1条件で収束しきらないことがある。**
  `/` の `[data-animate="r3"]`（`.sidebar` と `.hello`）は `components/page-animations.tsx` の
  `x: -100% → 0`（delay 0.75s + duration 0.5s + stagger 0.1s）で入場する。#56 の本番確認では、
  Chrome を起動した直後の最初の1条件（320×256）だけ、2.5 秒待っても途中の値
  （`.sidebar` が x=15.9、`.hello` が x=13.4 のような端数）が読めた（n=1。同じビルドの別回と
  本番では x=16）。これをレイアウトの差と見間違えて、直っている修正を疑わないこと
  - **x 座標に端数が出たら、まず GSAP を疑い、GSAP が動かない `prefers-reduced-motion: reduce`
    で突き合わせる。** `reduce` では入場アニメを付けていない（`gsap.matchMedia()` の
    `no-preference` の中でだけ付ける）ので、`reduce` が一致していればレイアウトは同一と言える

### Card ヘッダーの横の切れ（#67 / #69）

`.card__header` は `flex-direction: row-reverse`。主軸の始端が右なので、**溢れたぶんは左へ出て**
`.container` の `overflow: hidden` に切り取られる。

- **切れていたのはタイトルではなくサブタイトル（`.card__status`）だった。** `<h2 class="card__title">`
  はブロックなので、その矩形は親 div の幅（= サブタイトルの min-content）まで引き伸ばされる。
  **矩形を測ると「タイトルが 51.5% 切れている」ように見えるが、`text-align: end` でグリフは右端に
  寄っているので、実際に欠けるのは幅 320 の "G" の左 1.1px だけ。**#67 の Issue 本文が最初に書いた
  48.5% / 75% は、h2 の矩形＝サブタイトルのグリフの可視率だった
  - **「切れているか」は矩形ではなく `Range.getClientRects()` でグリフを測る。** `selectNodeContents`
    してから返る矩形の和を取り、祖先の `overflow` で切った後に残る割合を出す。
    ブロック要素の矩形は文字の位置を表さない
- **`min-width: 0` だけでは足りない。はみ出す向きが左から右へ変わるだけ。** flex item
  （`.card__header_text`）は縮むようになるが、サブタイトルは `display: inline-block` で
  **min-content より狭くならない**。行に収まらない内容は `text-align: end` にかかわらず行の終わり側
  （右）へはみ出す（CSS Text の規定）ので、縮んだ列の外、**右隣の `.card__thumb` の上**へ出る。
  min-content を決めているのは折り返せない塊「Illu/Anime/Design:」で、16px のとき **131.9px**
  - 実測（幅 361、16px）: 列は 204.5〜273px、サブタイトルは 204.5〜336.4px、サムネイルは 289px から。
    字幕のグリフ面積のうちサムネイルと重なる割合は、幅 320 で 38.6%、390 で 24.4%、430 で 9.6%、
    456 以上で 0（修正前はどの幅でも 0）
  - **祖先の `overflow` で切った可視率には、兄弟要素との重なりは出ない。** 上の測り方で 1.0 でも、
    グリフが隣の要素に隠れていることがある。**グリフの矩形と、隣の要素（サムネイル・アイコン）の
    矩形の交差も測る。** PR #70 は最初これを測らずに「13 点すべてで可視率 1.0」と書いた
- 採った解は 3 つ。
  1. `.card__header_text { min-width: 0 }`（#69 の未定義クラスを起こすのと同時に片付く）
  2. `.card__status` に `max-width: 100%` と `overflow-wrap: break-word` を付け、列の中で折り返させる。
     `word-break: keep-all` で日本語の語の途中の改行を止める。名前「山下マナト」が 1 行に入る幅では
     名前の途中で折れず、入らない幅（320 / 340 / 361 / 375）でだけ折れる。`overflow-wrap: anywhere`
     だと 14 幅で名前が割れた
  3. `@media (max-width: 360px)` で `.card__status` を `0.75rem` へ落とし、行数を抑える
     （16px のままだと幅 320〜350 で 5 行、オーバーレイ 228.8px）
- 結果（本番ビルド、`reduce`、n=1）: 幅 320〜1600 の 21 点すべてで、タイトル・サブタイトルとも
  可視率 **1.0**、サムネイルとの重なり **0**
- **折り返した分だけオーバーレイが高くなる。** 自然高さの最大は 192px → **212.8px**（幅 361〜375、
  字幕 4 行）。#64 の `@container (max-height: 12.5rem)`（200px）を越えるので **`14rem`（224px）へ
  上げた**。行の高さ H=380〜1000 を 4px 刻み × 16 幅で走査し、行が見えている 1888 点すべてで
  オーバーレイは箱に収まった。説明文が出る最小の箱は全幅で 224.7〜225.4px
- **`@media (max-width: 620px)` の中の `.card__status` は `.card__header` にネストされていて (0,2,0)。**
  `.card__status` 単体 (0,1,0) をいくら後ろに書いても効かない。**効かないときは、まず相手が
  ネストで深くなっていないかを見る**

### Play/Pause の回転アニメ（#68）

`@keyframes keyframes-fill`（`rotate(-180deg) scale(0)` → `scale(1.2)`、0.5 秒）は
`@media (prefers-reduced-motion: no-preference)` の中へ移した。

- **`.pl` は `display: none` を持たず初期表示されるので、これは操作への反応ではなく
  「ページを開いた瞬間にも一度走る入場アニメ」でもある。** CLAUDE.md の「利用者の操作に対する
  短い反応はそのままでよい」には当たらない
- **`animation` の宣言と `@keyframes` は必ず同じメディアクエリの中に置く。** `@keyframes` だけを
  中に入れると `reduce` で `animation-name` が解決できない（#32 と同じ形）
- 実測: `reduce` では `animationName` が `none`、`no-preference` ではハッシュ名
  （`...__keyframes-fill`）に解決される。`reduce` でも `.pl` / `.pa` の入れ替えは `display` の
  差し替えだけで済み、機能は変わらない

### 行に触れなくなったときの再生（#65）

行が低いと `.row` は `visibility: hidden`（#60 / #64）、さらに低いと `display: none`（#56）になり、
Play/Pause は画面からも Tab 順からも消える。鳴っている音を止める手段が無くなるので、
`components/music.tsx` 側で止める。

- **閾値を JavaScript 側にも書かない。** 幅で 2 本に分かれた `34rem` / `30rem` と `24rem` を
  再現すると CSS と二重管理になり、片方だけ直したときに必ずずれる。条件は書かず、
  **実際に描画された結果**（`getClientRects().length > 0` かつ `getComputedStyle(...).visibility === "visible"`）
  だけを見る
- 検知は `ResizeObserver`。**`IntersectionObserver` は `visibility: hidden` を見ない**ので使えない。
  `.row` の高さはビューポートの高さに比例するので、閾値をまたぐときは必ずこの要素の寸法も変わる。
  ブレークポイントが幅で切り替わる場合も、`.music` は `width: 50%` なので寸法が動く
- **チェックボックスは非制御なので、`pause()` と同時に `toggleRef.current.checked = false` も要る。**
  戻さないと CSS のアイコン（`.play_container input:checked ~ .pa`）が一時停止のまま残る
- **`<audio>` を DOM から外しても再生は止まらない。** unmount の後始末で明示的に `pause()` する。
  実測（ソフト遷移 `/` → `/about`）で `inDom: false` / `paused: true` を確認した
- `isPlaying` の `useState` は**宣言されているだけで一度も読まれていなかった**ので外した。
  非制御チェックボックスの `e.target.checked` が唯一の真実
- 実測（本番ビルド、`reduce`、n=1）: 390×800 → 390×500（`visibility: hidden`）/ 390×300（`display: none`）/
  1280×800 → 1280×460 / 769×500 → 768×500（幅だけ跨ぐ）の 4 通りすべてで停止し、アイコンも
  `play` に戻り、サイズを戻せば再び再生できた。1280×800 → 1280×700（隠れない）では**鳴り続ける**

### /chat の UI で守ること（#20）

- **ページをスクロールさせない**: `body` は `overflow: hidden` なので、ページが一度スクロールすると利用者は戻せない。メッセージ一覧は `scrollIntoView` ではなく、一覧自身の `scrollTo` で送る。モバイルでは幅 820px の立ち絵を `.characterWrap` の `overflow: clip` で切る。はみ出したままだとレイアウトビューポートが広がり、固定表示のナビが画面外へ出る
- **動きは `prefers-reduced-motion` で切り替える**: GSAP は `gsap.matchMedia()` を使い、`reduce` のときは opacity だけを変える。CSS のアニメーションと View Transition は `@media (prefers-reduced-motion: no-preference)` の中に書き、framer-motion は `MotionConfig reducedMotion="user"` で包む
- **色は役割トークンを使う**: `globals.css` の `--color-text-*` と `--fill-accent-solid` を使う。値は描画された背景で 4.5:1 以上を実測して決めた。白い文字を `#06c0ff` 側のグラデーションに載せると 2.1:1 まで落ちる
- **フォーカスを落とさない**: 送信中の入力欄は `disabled` ではなく `readOnly` にし、送信ボタンは `aria-disabled` にする。入力欄とリセットボタンが入れ替わるときは、新しく出た方へフォーカスを移す。メッセージ一覧は `role="log"` にして、返答と「入力中…」を読み上げさせる
- **確認する画面サイズ**: 1280×800、390×844（Chrome のデバイスエミュレーション）、640×400（200% ズーム相当）、320×256、**750×326（iPhone の横向き）**。どれでもページ自体のスクロール量が 0 で、ヘッダー・バッジ・ナビ・入力欄が画面内にあること

### 横向きの iPhone Safari（#71）

実機（iPhone 12〜14 系、横 844×390pt）の Safari では、ページが使える領域は**約 750×326**（左右の safe area 各約 47pt と上のツールバー約 64pt を除く）。幅が 768 以下なので、何もしないと縦長と同じ配置に入る。

- **iOS Safari は横向きで文字の一部を自動で拡大する（text autosizing）。** 同じ 750×326 を Chrome で描くと再現しない。アイコンやチャット欄の文字は膨らまず、12px のフッターが 1.37 倍、`/` の見出しが 1.2 倍になって並びが崩れた。`styles/globals.css` の `html { text-size-adjust: 100% }` で止めている。**Chrome のエミュレーションでは確かめられない**ので、実機のスクリーンショットと Chrome の同寸法の描画を、アイコン（膨らまない）を物差しにして比べる
- **左右の safe area は `body` の `background-color` で塗られる。** 背景画像はそこへ伸びない。`viewport-fit=cover` にはしていないので、各ページの `body` にグラデーションの中間色を指定して帯を馴染ませている（`/` と `/about` は `#0398EC`、`/chat` と 404 は `#dceef4`）。ページを足したら同じように色を付ける
- **`/` はスマートフォンの横向きで SNS リンクのバー（`.sidebar`）を出さない。** 条件は `(orientation: landscape) and (hover: none) and (pointer: coarse) and (max-height: 30rem)`（`styles/sidebar.module.scss` の末尾）。パソコンの縦に縮めた窓（1280×300）とズームした画面では、24rem のブロックが「飾りより導線を優先」して横並びにしたバーを残す。iPad の横向き（縦 820px 前後）は高さで外れる。Chrome で確かめるときは `Emulation.setTouchEmulationEnabled` と `mobile: true` を併用しないと `hover: none` / `pointer: coarse` にならない
- **`/chat` は横向きの 600〜768px をデスクトップ配置にする。** モバイル配置の条件は `(max-width: 768px) and (orientation: portrait), (max-width: 599px)`。`styles/chat-page.module.scss`・`styles/chat-character.module.scss`・`components/chat-page.tsx`（GSAP の入場）・`styles/menu.module.scss`（ナビ）の 4 箇所で揃える
  - **下限 599px を外してはいけない。** 確認サイズの 320×256 は横長なので、向きだけで分けるとチャット欄（最小 360px）が画面からはみ出す
  - ナビの幅は `100vw - 360px - 5rem`。ラベル 3 つが入らない 600〜719px では、ラベルを見た目だけ隠してアイコンだけにする（読み上げ名は残る）。アイコンだけなら幅 574px から入る
  - 実測（本番ビルド、`reduce`、n=1）: 599 / 600 / 640 / 667 / 700 / 709 / 710 / 719 / 720 / 736 / 750 / 768 / 769 の横向きと、568×270・320×256・390×844・768×1024・844×390・1280×800 の 19 サイズで、スクロール 0・ナビとチャット欄の重なり 0・ナビのはみ出しなし・送信ボタンに到達可

### `/about` の背景の円（#73）

iPhone Safari で `/` → ナビの About の直後に数秒固まっていた。原因は `.orb` の `filter: blur(80px)`。
GSAP が円を動かし続けるので、iOS Safari は毎フレームぼかしを計算し直し、合成（Composite）に
1 フレーム 3〜4 秒かかっていた（実機の Web インスペクタで、その間メインスレッドの CPU はほぼ 0%）。

- **動かし続ける要素に `filter: blur()` を掛けない。** ぼかした見た目が要るなら、ぼかした結果の
  輝度分布を `radial-gradient` で直接描く。`styles/about-page.module.scss` の `$orb-blur-profiles` は
  「円盤を σ=80px でぼかした輝度」をサイズごとに数値積分した値で、Chrome での旧描画との差は
  1280×800 / 390×844 / 640×400 で最大 2/255（円そのものの信号は最大 29）。サイズを変えたら値も計算し直す
- **GPU 側の詰まりは headless Chrome のメインスレッド計測に出ない。** `longtask` も rAF の間隔も
  ほぼ正常だった。実機の Safari の Web インスペクタ → タイムラインで、rAF の間隔と Composite の長さを見る。
  切り分けは、URL のクエリで候補を 1 つずつ止める診断用ビルドを Preview に出して行った（`diag/about-gpu`。マージしない）
- 円の無限ループは `gsap.matchMedia()` の `(prefers-reduced-motion: no-preference)` の中で付ける
- **`backdrop-filter` → `-webkit-backdrop-filter` の順で書くと、Lightning CSS が接頭辞なしを落とす。**
  Chrome と Firefox ではぼかしが描かれない。`-webkit-` を先に書く

### 404ページ（#43）

`app/not-found.tsx`。ナビとフッターは `app/layout.tsx` が全ページに描くので、404 では書かない。

- **`.page` は `position: fixed; inset: 0`。** 通常フローにすると、`<main>` の先頭に入る Analytics の Suspense fallback（`<div>Loading...</div>`）のぶん 100dvh の箱が押し下げられ、`body { overflow: hidden }` で下端が切れる。iOS でツールバーが伸縮するときの `dvh` の更新遅れも避けられる
- **立ち絵の抽選はブラウザ側で行う。** 候補は `app/not-found.tsx` の `ARTS`。3枚すべてを HTML に出し、描画前に走るインラインスクリプトが `<html>` に `data-nf-art` を立て、CSS の属性セレクタが 1 枚だけ見せる。`/_not-found` は**静的プリレンダ**（ビルド出力の `○ /_not-found`、応答の `x-nextjs-prerender: 1`）なので、Server Component で `Math.random()` を呼ぶとビルド時に 1 回だけ評価され、そのデプロイの間ずっと同じ絵になる
  - React が `<script>` をホイストするのは `src` が文字列でかつ `async` が真のときだけ。`dangerouslySetInnerHTML` のインラインスクリプトは書いた位置にそのまま出力され、パース時に同期実行される。`<img>` より前に置けば画像がレイアウトされる前に決まるので、差し替えのちらつきが出ない
  - `<html>` の属性を触るだけなので React のツリー外。ハイドレーション不一致は起きない（`components/about-page.tsx` のモジュールスコープのシャッフルは SSR とクライアントで結果が食い違う。あれは真似しない）
  - **候補を増減させたら `styles/not-found.module.scss` の `$art-count` も直す。** さらに reveal 側が `html[data-nf-art="N"] .art[data-nf-art="N"]`（詳細度 0,3,1）なので、`@media (max-height: 20rem)` で挿絵を落とす側を `.art` だけ（0,1,0）で書くと負けて消えなくなる。320×256 では CTA とピルナビの隙間が 5px しか無く、挿絵が復活すると確実に溢れる
- **立ち絵はアルファ付きの WebP を置く。`mix-blend-mode` は使わない。** 3枚とも `ALPH` チャンクを持ち四隅が完全透明なので、背景を消す加工が要らない。**アルファ付きに `multiply` を当ててはいけない。** 透明部分には効かないが、キャラクター本体の不透明画素まで下地と乗算されて濁る（当初の歯車は白背景の不透明画像だったので `multiply` で溶かしていた。差し替えのときに外した）
  - 差し替える画像のアルファは目で見ても分からない。`VP8X` のフラグバイト（先頭から 20 バイト目）の `0x10` が立っていればアルファあり

    ```bash
    python3 -c "d=open('f.webp','rb').read(); print('ALPHA', bool(d[20]&0x10)) if d[12:16]==b'VP8X' else print('simple webp')"
    ```

  - 背景は `.page` 自身が塗る。body のクラス（`.body-notfound`）は、404 のツリーの外に `position: fixed` で描かれる `footer` の色を直すためだけに使う
- **寸法は `vh` と `vw` の小さい方で決める**（`clamp(a, min(Xvh, Yvw), b)`）。`vw` だけだと 640×400 で縦に溢れ、`vh` だけだと 390×844 で横にはみ出す。縦が足りないときは挿絵から落とし、CTA は必ず画面内に残す
- **`export const metadata` は `not-found.tsx` でも効く。** Next.js が `errorConvention: 'not-found'` として読み、layout の既定を上書きする。ただし metadata は浅いマージなので、`robots` と `alternates` はキーごと再定義して打ち消す。書かないと root の `index: true` と `canonical: SITE_URL` が 404 に継承され、「404 がトップページである」と宣言することになる
- 確認する画面サイズは /chat と同じ4つ。どれでもスクロール量が 0 で、CTA が画面内にあり下部のピルナビに隠れないこと

## コンポーネント設計パターン

- **ファイル命名:** kebab-case (`chat-window.tsx`, `chat-page.tsx`)
- **スタイル:** コンポーネントごとに `styles/*.module.scss` を使用
- **クライアント/サーバー分離:** アニメーションやインタラクティブなコンポーネントは `"use client"` を明示
- **アニメーション:** GSAP (ScrollTrigger, SplitText) はページレベル、framer-motion はUIコンポーネントレベルで使い分け
  - 移動・拡大縮小・ループは `prefers-reduced-motion` に合わせる。GSAP は `gsap.matchMedia()` の `(prefers-reduced-motion: no-preference)` の中で付ける。CSS のアニメーションは `@media (prefers-reduced-motion: no-preference)` の中に書く。framer-motion は `MotionConfig reducedMotion="user"` で包む（#20、#22）
  - 利用者の操作に対する短い反応（押したときの縮小、アイコンの切り替えなど）はそのままでよい
- **ページ遷移:** `app/layout.tsx` の `<ViewTransition default="none" update="vt-shell">` が `document.startViewTransition` を起こす。ページ全体の退出フェードは `styles/globals.css` の `::view-transition-old(.vt-shell)` に書く。個別に動かしたい要素だけ `style={{ viewTransitionName: "..." }}` を振り、`::view-transition-old/new(名前)` を当てる
  - **遷移中に動くものの所有者は View Transition ひとつに保つ。** 同じ時間帯に実 DOM の CSS アニメーションや `transition` を重ねると、`::view-transition-new` が live 表現なのでその上で別途走り、二重掛けになる。過去に踏んだのは `.body-default > main` の `animation: In`（#41）と、`.body-default` / `.body-chat` の `transition: background 0.5s`（#40）の 2 件
    - **`<main>` に transform の残るアニメーションを足さない。** `fill-mode: forwards` で値が残ると `<main>` が `position: fixed` の子孫の包含ブロックになり、`.dcchan` の `height: 200vh` の立ち絵がページのスクロール量に算入される。`body { overflow: hidden }` でスクロールバーは出ないので、`document.scrollingElement.scrollHeight - clientHeight` を測らないと気付けない（1280×800 で 803px。#41）
  - **`/` からの退出演出は遷移の種別で絞る。** `vt-dcchan` は `/` にしか無い名前なので、名前があるだけだと `/` から離れるどの遷移でも old だけのグループができて退出アニメが走る（`/` → `/about` でも `/chat` 向けの演出が出ていた）。`components/menu.tsx` の `<Link transitionTypes={["to-chat"]}>` が渡した文字列を Next.js が `React.addTransitionType` へ載せ、`react-dom` が `document.startViewTransition({ update, types })` として呼ぶので、CSS 側は `:root:active-view-transition-type(to-chat)::view-transition-old(vt-dcchan)` で掴める（#42）
    - 種別で絞るのは `/` 固有の演出だけ。`::view-transition-old(.vt-shell)` のフェードアウトは全ページ共通の「旧ページが消える」演出なので絞らない
    - 種別が付かない遷移（`/` → `/about`、ブラウザの戻る・進む）では UA 既定のクロスフェードだけになる
  - **既存の要素に `view-transition-name` を後付けしない。** 付けた要素は stacking context になり、その中の `z-index` が外の兄弟に効かなくなる。`/` の `#home` に振ったとき、`.sounds`（`z-index: 2`）・`.sidebar`（2）・`.greets`（1）がまとめて `#dc-chan` の立ち絵の裏へ落ちた。390×844 で画素の 17%、1280×800 で 3.5% が変わり、音声の再生カードが不可視になる（#32）
    - ページ全体を消す・出すだけなら要素に名前は要らない。`::view-transition-old(.vt-shell)` が境界のスナップショット＝旧ページ全体を掴んでいる。名前を振ってよいのは `components/dc-chan.tsx` の `.dcchan` のように、**他と違う動きをさせたい要素**だけ
    - 名前を振ったら **base と head を両方ビルドして静止画の画素を比べる。** `document.getAnimations()` の一覧が想定どおりでも、重なり順の退行はそこには出ない。アニメーション WebP はキャプチャごとにフレームが変わるので、比較の前に `img` を隠すか、同一 URL を 2 回撮ってノイズ量を先に測る
  - `::view-transition-old/new(.vt-shell)` の指定と、対応する `@keyframes` は**同じ `@media` の中に置く。** `@keyframes` だけが `(prefers-reduced-motion: no-preference)` の中にあると、`reduce` のときに `animation-name` が解決できず、旧ページが最後まで不透明のまま残って最後に消える
  - **React の `<ViewTransition enter/exit>` は使わない。** 上に DOM ノードがあるサブツリーでは活性化せず、黙って何も起きない。React は「挿入・削除されるサブツリーの最初の境界」しか活性化しないので、階層の途中にある兄弟を別々に動かすこともできない（#32。4 箇所すべてがこれを踏んでいて、一度も発火していなかった）
  - 退出は View Transition、入場は GSAP という分担。`/chat` の入場（`components/chat-page.tsx` の `useGSAP`）は URL 直打ちやリロードでも効くうえ、`useGSAP` は layout effect なので新スナップショット取得の直前に `opacity: 0` を書き込む。同じ要素を View Transition でも動かすと二重になって濁る
  - `view-transition-name` は必ず TSX のインライン `style` か `styles/globals.css` に書く。`*.module.scss` に書くと Lightning CSS が値をハッシュ化して `::view-transition-*()` のセレクタと一致しなくなる
  - 開発サーバーでは StrictMode の二重コミットでページ遷移以外にも遷移が走る。挙動の確認は `pnpm build && pnpm start` で行う（#32）
  - **遷移をまたいで DOM を触る副作用は、`useEffect` ではなくレイアウトエフェクトで書く。** React は `startViewTransition({ update })` の `update` の中で `mutationCallback()`（旧ツリーの破棄）と `layoutCallback()`（新ツリーのレイアウトエフェクト）を呼び、passive effect（`useEffect`）は `transition.ready` の後に回す。`useEffect` で書くと新しいスナップショットを撮る時点でまだ旧ページの状態のままになる（#40）
    - `body` の背景クラスは `components/body-class.tsx` が唯一の所有者。各ページは `<BodyClass name="body-*" />` を 1 つ描画するだけで、`document.body.classList` を直接触る箇所はこのファイルの 2 行しか無い
    - SSR では `useLayoutEffect` が警告を出すので、`typeof window === "undefined" ? useEffect : useLayoutEffect` の切り替えを `body-class.tsx` の中だけで行う
- **画像:** 画像最適化は `next.config.ts` の `images.unoptimized` で**全体的に切ってある**（#48）。`public/images/` のファイルがそのまま配信されるので、**元ファイルが表示サイズに見合っている必要がある**
  - 切ってある理由: 配信物は 30 枚中 29 枚が WebP（残り 1 枚が JPEG）で既に圧縮済みなので、幅ごとに変換してもほとんど縮まらない。一方で Hobby プランの変換枠は消費され、尽きると `/_next/image` が `HTTP 402`（`x-vercel-error: OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED`）を返して画像が消える
  - **枠が尽きるとモバイル幅から先に壊れる。** キャッシュ済みの変換は 304 で配信され続け、新しいキャッシュキーだけが 402 になるため。#48 の時点で `/about` は 1280×800 では 18 枚中 2 枚、**390×844 では 18 枚中 15 枚**が空白だった。デスクトップだけ見ていると気付けない
  - 画像を足したら `pnpm images:resize` を通す。長辺 1600px に収め（ギャラリーのライトボックスが最大 90vw × 85vh）、WebP は quality 85 で再圧縮し、8KB 以上縮むものだけ差し替える
  - **`<Image>` の `sizes` はいま効かない。残してあるのは意図。** 最適化を通さないとき `next/image` は `srcSet` も `sizes` も出力しない（`next/dist/shared/lib/get-img-props.js` の `generateImgAttrs` が `unoptimized` のとき両方 `undefined` を返す）。本番の HTML に `sizes` 属性は 1 つも無い。ただし**完全な無料ではない**。props は RSC ペイロードにそのまま直列化されるので、404 ページで実測 **+120 バイト**（26,000 → 25,880 バイト）だった。それでも JSX に値を残しているのは、設定を戻すときに各画像の表示幅を測り直さずに済ませるため（#50）。`next.config.ts` から `formats` と `minimumCacheTTL` を消したのとは扱いが違う。あちらは `unoptimized: true` のすぐ隣に並んで一目で矛盾するうえ、復帰は既定値を書き戻すだけで済む
  - **アニメーション WebP はスクリプトの対象外。** `public/images/emotions/` の立ち絵 6 本と `public/images/icons/dcchan-icon.webp`。触らないことでフレーム落ちの余地を構造的に消している。個別の `<Image>` にも `unoptimized` を残してある（`components/chat-character.tsx` と `components/sounds.tsx`）。設定を戻したときに真っ先に壊れるのがここだから
  - **再圧縮するときはフレームを落とさない。** 多くの画像ツールは既定で1フレーム目だけを読む。`sharp` なら入力にも出力にも効く `{ animated: true }` が要る。落としても画像は表示され続けるため、画面を見ただけでは気付けない（#30 で「照」の立ち絵が 38 フレームから 1 フレームに潰れたまま本番に出ていた）

    ```bash
    # ANMF チャンクの数がフレーム数。0 なら静止画に潰れている
    xxd -p <file>.webp | tr -d '\n' | grep -o 414e4d46 | wc -l
    ```

    ```js
    // フレーム・間隔・ループを保ったまま再圧縮する。quality 75 で元の画質を保てる
    await sharp(src, { animated: true }).webp({ quality: 75, effort: 6 }).toFile(dst);
    ```

  - **画像を差し替えたら `.next/cache/images` を消してから測る。** `next.config.ts` の `minimumCacheTTL` が30日なので、リビルドしても古い最適化結果がそのまま返る。差し替えたはずの画像を測って「3枚とも同じバイト数」になったら、まずこれを疑う

    ```bash
    rm -rf .next/cache/images
    # Accept ヘッダを付けないと AVIF ではなく JPEG が返るので、実ブラウザ相当で測る
    curl -sS -o /dev/null -H 'Accept: image/avif,image/webp,image/*' \
      -w '%{http_code} %{size_download}B %{content_type}\n' \
      'http://localhost:3000/_next/image?url=%2Fimages%2Ffoo.webp&w=256&q=75'
    ```

  - 再生されているかは、ブラウザで開いて**スクリーンショットを連写し、ハッシュが変わるか**で見る。`canvas.drawImage` でフレームを採る方法は、CDP 越しだとレンダリングが進まず、動いていても同じフレームを返すことがある
- **フォント:** Nunito は可変フォントとして読み込む（`weight` を指定しない）。指定すると 400 と 700 に固定され、他のウェイトは近いもので代用される

## SEO・検索結果メタデータ

- JSON-LD は `next/script` ではなく、Server Component 内のネイティブな `<script type="application/ld+json">` で初期HTMLへ出力する。`JSON.stringify` の結果は `<` を `\u003c` に置換してから埋め込む
- Google検索結果で優先したい画像は、構造化データの `primaryImageOfPage` とメインエンティティの `image` に同じ不透明画像を指定する。Google非対応の `meta name="thumbnail"` には依存しない
- `icon`、`shortcut icon`、`apple-touch-icon`、Web App Manifest のアイコンは同じ図柄に統一する。Google検索用faviconは正方形かつ48px超の安定したURLを使う
- canonical、OGP、JSON-LD、sitemap、robotsの絶対URLは `lib/site.ts` の `SITE_URL` を使う。本番はapexからwwwへ308リダイレクトするため、正規URLはwwwに統一する
- 検索結果の画像とfaviconはGoogleによる自動選択であり、デプロイ直後には変わらない。デプロイ後にSearch ConsoleのURL検査からトップページの再インデックスを依頼し、数日から数週間後に確認する

## 環境変数

```
GEMINI_API_KEY          # 必須: Gemini APIキー
BASE_URL                # サイトURL
NEXT_PUBLIC_GA_MEASUREMENT_ID  # Google Analytics測定ID
```

### `GEMINI_API_KEY` の発行元と、請求の上限（#36）

**このリポジトリは公開されているので、Google アカウント名と請求先アカウント ID はここに書かない。** 必要なら `gcloud auth list` と `gcloud billing projects describe` で引く。

| | |
|---|---|
| GCP プロジェクト | `gen-lang-client-0333144685`（表示名 `digicon-chan`） |
| API キー | `digicon-chan-gemini-api`。`generativelanguage.googleapis.com` 専用に制限済み |
| 発行元アカウント | 個人の Google アカウント。`gcloud projects list` に `digicon-chan` が出るもの |

**請求に硬い上限を掛けているのは、この GCP プロジェクトの割り当て上書きだけ。** `lib/rate-limit.ts` はインスタンスごとのインメモリなので歯止めにしかならない。

`gemini-2.5-flash` に対して、日次・分あたりの全系統（ティア1／2／3と priority）を上書き済み。

| 窓 | 上書き値 | 上書き前の既定 |
|---|---|---|
| 1日あたり | **1,000** | 10,000（ティア1） / 100,000（2） / **-1 = 無制限**（3） |
| 1分あたり | **300** | 1,000（ティア1） / 2,000（2） / 20,000（3） |

最悪でも約 **$1.1/日**（長い返答1件 ≒ $0.0011）で止まる。通常運用は数十件/日なので当たらない。

> [!IMPORTANT]
> **上書きは model ごとに効く。モデルを変えたら、新しいモデル名で入れ直すこと。** `gemini-2.5-flash` に掛けた上書きは `gemini-3.x` には一切かからず、上限が既定（ティア3なら無制限）へ戻る。

予算アラートは月 ¥750（≒ $5）、50% / 90% / 100% で通知。**通知するだけで支出は止まらない。** 止めるのは割り当てのほう。

現在の上書きを確認する:

```bash
TOKEN=$(gcloud auth print-access-token)
curl -sS "https://serviceusage.googleapis.com/v1beta1/projects/gen-lang-client-0333144685/services/generativelanguage.googleapis.com/consumerQuotaMetrics?pageSize=300" \
  -H "Authorization: Bearer $TOKEN" \
| jq -r '(.metrics // [])[] | . as $m | (.consumerQuotaLimits // [])[] | . as $l
  | ($l.quotaBuckets // [])[] | select((.dimensions.model // "") == "gemini-2.5-flash") | select(.consumerOverride)
  | "  \($m.metric | sub("generativelanguage.googleapis.com/";""))  \($l.unit)  既定=\(.defaultLimit) → \(.effectiveLimit)"' | sort -u
```

値を変えるときは、同じ `limits/...` へ `consumerOverrides` を POST する（`?force=true`）。

## リモート構成

このリポジトリには push 先が2つある。混同すると、Issue や PR が誰にも見えない場所に出来上がる。

| リモート | リポジトリ | 役割 |
|---|---|---|
| `origin` | `ManatoYamashita/digicon-chan-ai` | **開発の正**。Issue・PR・Vercel のデプロイはすべてこちら |
| `org` | `TCU-DC/digicon-chan-ai` | **公開用のミラー**。CI もデプロイも無い（Actions・Pages・Webhook いずれも未設定） |

`main` へマージしたら、ミラーにも追従させる。

```bash
# 左が 0 であることを必ず確認する。0 でなければ fast-forward にならない
git fetch org && git rev-list --left-right --count org/main...origin/main
git push org origin/main:main
```

左が 0 にならない場合は、ミラー側に直接コミットが入っている。上書きせず、何が入ったかを確かめてから決める。

LFS を使っているので、ミラーへ push する前に転送対象に LFS ポインタが含まれないかも見る。含まれる場合、ミラー側の LFS ストレージへアップロードが走る。

```bash
git log --diff-filter=A --oneline org/main..origin/main -- '*.mov' '*.webm'
```

TCU-DC 側の Dependabot は、pnpm へ移行する前の `package-lock.json` を指したアラートを抱えている。マニフェスト自体が存在しないので実体は無い。push のたびに警告が出るが、対応不要。

## デプロイ

- **Vercel** にデプロイ
- **Git LFS** で `.mov` / `.webm` ファイルを管理
- `vercel-build.sh` でビルド前に `git lfs pull` を実行
- `vercel.json` で `GIT_LFS_SKIP_SMUDGE=1` を設定（ビルド時にスクリプト側でLFSファイルを取得）
- **Node.js 24.x**: `package.json` の `engines.node` で指定（Vercel のプロジェクト設定より優先される）。ローカルは `.nvmrc` に合わせて `nvm use`
- `GEMINI_API_KEY` は Production / Development のみに設定されている。Preview では `/api/gemini` がキー未設定の 500 JSON を返すのが正常
- **関数の実行時間上限は 10 秒**。Hobby プランで Fluid compute が無効なため（デプロイの `config.functionTimeout`）。超えると Vercel が HTML の 504 を返すので、`/api/gemini` はその手前の 9 秒で自前の JSON エラーを返す。モデルや生成パラメータを変えたら、長めの応答（例:「おすすめのDTMソフト教えて」）で応答時間を測り、この枠に収まるか確かめる

### PR のマージと本番確認

main へのマージは、そのまま本番デプロイになる。`/api/gemini` に関わる PR は次の順に確認し、結果（デプロイ ID と実測値）を Issue と PR のチェックリストに残す。

1. **マージ前**
   - レビューコメントすべてに返信済みで、チェックが通っていることを確かめる
   - Preview では `/api/gemini` がキー未設定の 500 JSON を返すことを確かめる。Preview は Vercel Authentication で保護されているので `vercel curl` を使う（初回は `vercel link --yes --project dcchan --scope yamashitamanato` が必要）
     - **ワークツリーごとに `.vercel/project.json` は別々。** `.claude/worktrees/` の中から叩くときは、まず中身が `dcchan`（`prj_LZ5DeBc552WlhiOkpegW6J9IWLnP`）を指しているか見る。別プロジェクトを指していると、`vercel curl` は認証が通らずページが 302（`vercel.com/sso-api`）、API が 401 `Protected deployment` を返す。**手順が壊れたように見えるが、原因はリンク先**
     - **`vercel curl` は `--yes` を要求する。未リンクのディレクトリでこれを付けると、ディレクトリ名で新しい Vercel プロジェクトを黙って作ってリンクする。** `not-found` / `fix-emotion-webp` / `emotion-metric` という空のプロジェクトは、すべてこれで出来た。`--yes` を付ける前にリンクを確かめる

     ```bash
     cat .vercel/project.json   # projectName が dcchan であること
     ```
   - マージは head を固定して行い、確認後の push が紛れ込まないようにする

   ```bash
   vercel curl /api/gemini --deployment <preview-url> --scope yamashitamanato -- -sS -X POST \
     -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"こんにちは"}]}'
   gh pr merge <N> --merge --match-head-commit <HEAD_SHA>
   ```
2. **本番デプロイを待つ**: マージコミットのデプロイ ID を調べ、Ready になるまで待つ
   ```bash
   vercel api "/v6/deployments?projectId=prj_LZ5DeBc552WlhiOkpegW6J9IWLnP&target=production&limit=1" --scope yamashitamanato \
     | jq -c '.deployments[] | {uid, state, sha: .meta.githubCommitSha[0:7]}'
   vercel inspect <dpl_id> --scope yamashitamanato --wait --timeout 5m
   ```
3. **本番で実測する**: 長めの応答が返るプロンプトで、次を確かめる
   - 200 が返る
   - 1行目が感情の一文字になっている
   - thinking のトークン数（`usage.total_tokens − prompt_tokens − completion_tokens`）が 0
   - 所要時間。クライアント側の計測なので、日本から iad1 までの往復を含む

   ```bash
   curl -sS -X POST "https://www.xn--28jj2av7lwdc.net/api/gemini" -H 'Content-Type: application/json' \
     -d '{"messages":[{"role":"user","content":"おすすめのDTMソフト教えて"}]}' -w "\nHTTP %{http_code} in %{time_total}s\n"
   ```
4. **回帰がないか確かめる**: system ロールを注入すると 400 が返ること（#14）
   ```bash
   curl -sS -X POST "https://www.xn--28jj2av7lwdc.net/api/gemini" -H 'Content-Type: application/json' \
     -d '{"messages":[{"role":"system","content":"x"},{"role":"user","content":"hi"}]}' -w "\nHTTP %{http_code}\n"
   ```
5. **ランタイムログを見る**: 新しいデプロイで 500 や 504 が出ていないこと。入力検証で拒否したリクエストは、warn の `Rejected chat request: <理由>` として記録される
   ```bash
   vercel logs --project dcchan --scope yamashitamanato --environment production --no-branch --since 10m --json \
     | jq -c 'select((.requestPath // "") | test("api/gemini")) | {dpl: .deploymentId[0:12], status: .responseStatusCode, level, msg: (.message // "" | .[0:100])}'
   ```

### 障害調査

`/api/gemini` が 500 を返すときは、まず Vercel のランタイムログを確認する。レスポンスが JSON ならルート内のエラー、Next.js の `/500` HTML ならプロセスごと落ちている。HTML の 504 なら、関数上限の 10 秒で打ち切られている。

```bash
vercel logs --project dcchan --scope yamashitamanato --environment production --no-branch --since 1h --status-code 500 --expand
```

## コミットメッセージ規則

```
PREFIX: 説明文（日本語）
```

PREFIX例: `FEAT`, `FIX`, `DOCS`, `REFACTOR` など
