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

### チャット機能のデータフロー

```
ChatPage (状態管理: messages, emotion, error)
  → ChatWindow (入力・メッセージ表示)
    → POST /api/gemini (messages配列を送信)
      → Gemini API (OpenAI互換エンドポイント)
    → parseEmotionResponse (レスポンス1文字目から感情を抽出)
  → ChatCharacter (感情に応じた画像切り替え)
```

### 感情表現システム

APIレスポンスの1文字目で感情を判定（`components/chat-page.tsx`）:
- `楽` `怒` `哀` `困` `照` → 対応する感情画像に切り替え（7秒後にdefaultへ戻る）

### APIルート (`app/api/gemini/route.ts`)

- Gemini 2.5 Flash モデル使用。thinking は `reasoning_effort: "none"` で切ってある（#17）
  - 有効だと長めの応答が 11 秒を超え、関数上限 10 秒に収まらない。切ると応答は 1〜3 秒で、感情の一文字やキャラクター設定の遵守は変わらない
  - 2.5 Pro と Gemini 3 系は thinking を切れない。モデルを移行するときは `"minimal"` で応答時間とフォーマットを測り直す
- インメモリレート制限（8 RPM、スライディングウィンドウ）。上流への試行ごとに記録し、枠が尽きたら再試行もしない
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

## コンポーネント設計パターン

- **ファイル命名:** kebab-case (`chat-window.tsx`, `chat-page.tsx`)
- **スタイル:** コンポーネントごとに `styles/*.module.scss` を使用
- **クライアント/サーバー分離:** アニメーションやインタラクティブなコンポーネントは `"use client"` を明示
- **アニメーション:** GSAP (ScrollTrigger, SplitText) はページレベル、framer-motion はUIコンポーネントレベルで使い分け
  - 移動・拡大縮小・ループは `prefers-reduced-motion` に合わせる。GSAP は `gsap.matchMedia()` の `(prefers-reduced-motion: no-preference)` の中で付ける。CSS のアニメーションは `@media (prefers-reduced-motion: no-preference)` の中に書く。framer-motion は `MotionConfig reducedMotion="user"` で包む（#20、#22）
  - 利用者の操作に対する短い反応（押したときの縮小、アイコンの切り替えなど）はそのままでよい
- **ページ遷移:** View Transitions API で entry/exit アニメーションを定義（`styles/globals.css`）
- **画像:** アニメーション WebP（`public/images/emotions/` の立ち絵）は `next/image` に `unoptimized` を付ける。画像最適化はどの幅でも元のファイルを返すだけで、幅ごとにキャッシュを作って無駄になる
- **フォント:** Nunito は可変フォントとして読み込む（`weight` を指定しない）。指定すると 400 と 700 に固定され、他のウェイトは近いもので代用される

## SEO・検索結果メタデータ

- JSON-LD は `next/script` ではなく、Server Component 内のネイティブな `<script type="application/ld+json">` で初期HTMLへ出力する。`JSON.stringify` の結果は `<` を `\u003c` に置換してから埋め込む
- Google検索結果で優先したい画像は、構造化データの `primaryImageOfPage` とメインエンティティの `image` に同じ不透明画像を指定する。Google非対応の `meta name="thumbnail"` には依存しない
- `icon`、`shortcut icon`、`apple-touch-icon`、Web App Manifest のアイコンは同じ図柄に統一する。Google検索用faviconは正方形かつ48px超の安定したURLを使う
- 検索結果の画像とfaviconはGoogleによる自動選択であり、デプロイ直後には変わらない。デプロイ後にSearch ConsoleのURL検査からトップページの再インデックスを依頼し、数日から数週間後に確認する

## 環境変数

```
GEMINI_API_KEY          # 必須: Gemini APIキー
BASE_URL                # サイトURL
NEXT_PUBLIC_GA_MEASUREMENT_ID  # Google Analytics測定ID
```

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
