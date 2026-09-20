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

- **Next.js 16** (App Router + Turbopack)
- **React 19**
- **TypeScript** (strict mode, パスエイリアス `@/*` → `./`)
- **Gemini API** - OpenAI SDK (`openai` パッケージ) 経由で `generativelanguage.googleapis.com` に接続
- **GSAP** + **framer-motion** - アニメーション
- **Sass** (SCSS Modules) - スタイリング
- **@svgr/webpack** - SVGをReactコンポーネントとしてインポート
- **View Transitions API** (`next.config.ts` の `experimental.viewTransition: true`)

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
  - インメモリなので Vercel の関数インスタンスごとに別々に数える。**厳密な保証ではなく歯止め**
  - `Retry-After` は最も古い記録が窓から外れるまでの秒数を返す。固定値ではない
  - **画面に出すときは `describeRetryAfter` で単位を丸める。** 秒のまま出すと、1日の上限に当たったときに「86340秒くらい待ってから」になる。そもそもインスタンスごとの数え方なので、秒の精度に意味は無い
- **返答の長さはおおむね200字を目安**にさせている（#33）。「200字以内」と硬く決めると短い返答まで痩せる（実測で 105字 → 69字）ので、目安にとどめる
  - 実測: 上限なしだと長い質問への返答が平均929字（最大1407字）。目安を付けると348字に収まり、短い質問への返答は111字で変わらない。コストは10万件あたり $85.57 → $55.27（-35%）
  - **コストは出力が支配的**（出力 $2.50/Mtok に対し入力 $0.30/Mtok）。削るなら出力を削る
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

### /chat の UI で守ること（#20）

- **ページをスクロールさせない**: `body` は `overflow: hidden` なので、ページが一度スクロールすると利用者は戻せない。メッセージ一覧は `scrollIntoView` ではなく、一覧自身の `scrollTo` で送る。モバイルでは幅 820px の立ち絵を `.characterWrap` の `overflow: clip` で切る。はみ出したままだとレイアウトビューポートが広がり、固定表示のナビが画面外へ出る
- **動きは `prefers-reduced-motion` で切り替える**: GSAP は `gsap.matchMedia()` を使い、`reduce` のときは opacity だけを変える。CSS のアニメーションと View Transition は `@media (prefers-reduced-motion: no-preference)` の中に書き、framer-motion は `MotionConfig reducedMotion="user"` で包む
- **色は役割トークンを使う**: `globals.css` の `--color-text-*` と `--fill-accent-solid` を使う。値は描画された背景で 4.5:1 以上を実測して決めた。白い文字を `#06c0ff` 側のグラデーションに載せると 2.1:1 まで落ちる
- **フォーカスを落とさない**: 送信中の入力欄は `disabled` ではなく `readOnly` にし、送信ボタンは `aria-disabled` にする。入力欄とリセットボタンが入れ替わるときは、新しく出た方へフォーカスを移す。メッセージ一覧は `role="log"` にして、返答と「入力中…」を読み上げさせる
- **確認する画面サイズ**: 1280×800、390×844（Chrome のデバイスエミュレーション）、640×400（200% ズーム相当）、320×256。どれでもページ自体のスクロール量が 0 で、ヘッダー・バッジ・ナビ・入力欄が画面内にあること

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
- **ページ遷移:** View Transitions API で entry/exit アニメーションを定義（`styles/globals.css`）
- **画像:** アニメーション WebP（`public/images/emotions/` の立ち絵と `public/images/icons/dcchan-icon.webp`）は `next/image` に `unoptimized` を付ける。画像最適化はどの幅でも元のファイルを返すだけで、幅ごとにキャッシュを作って無駄になる
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
