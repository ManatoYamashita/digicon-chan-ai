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
ChatPage (状態管理: messages, emotion, tokenUsage)
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

- Gemini 2.5 Flash モデル使用
- インメモリレート制限（8 RPM、スライディングウィンドウ）。上流への試行ごとに記録し、枠が尽きたら再試行もしない
- 上流の呼び出しは `lib/gemini-client.ts` に集約している（#13）
  - SDK の自動リトライは `maxRetries: 0` で止めてあり、再試行は `withRetry` だけが行う。SDK 側と二重にすると、1回の送信で上流を最大9回呼ぶ
  - 再試行するのは 429/503 だけで、エクスポネンシャルバックオフで最大2回
  - 試行とバックオフを合わせて 9 秒で打ち切る（`UPSTREAM_DEADLINE_MS`）。各試行には残り時間を SDK の `timeout` として渡し、残りが 4 秒を切ったら再試行しない
- システムプロンプトにキャラクター設定を埋め込み
- 入力検証（`lib/chat-request.ts` の `parseChatRequest`）。不正なリクエストは Gemini を呼ぶ前に 400 で返すので、レート制限の枠を消費しない
  - role は `user` / `bot` だけを受け付け、`bot` は `assistant` に正規化する。`system` などを通すとキャラクター設定を上書きされる（#14）
  - `content` は空でない文字列のみ。user は 1000 字を超えたら 400、bot 履歴は 4000 字で切り詰める
  - 件数は最大9件（user は5件まで）で、末尾は必ず user

### セッション制限

チャットは最大5メッセージまで送信可能。その後リセットが必要。送信は Cmd+Enter (Mac) / Ctrl+Enter (Windows)。上限値（`MAX_PROMPTS` など）は `lib/chat-request.ts` でクライアントとサーバーが共有し、サーバー側でも強制している。

## コンポーネント設計パターン

- **ファイル命名:** kebab-case (`chat-window.tsx`, `chat-page.tsx`)
- **スタイル:** コンポーネントごとに `styles/*.module.scss` を使用
- **クライアント/サーバー分離:** アニメーションやインタラクティブなコンポーネントは `"use client"` を明示
- **アニメーション:** GSAP (ScrollTrigger, SplitText) はページレベル、framer-motion はUIコンポーネントレベルで使い分け
- **ページ遷移:** View Transitions API で entry/exit アニメーションを定義（`styles/globals.css`）

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
- **関数の実行時間上限は 10 秒**。Hobby プランで Fluid compute が無効なため（デプロイの `config.functionTimeout`）。超えると Vercel が HTML の 504 を返すので、`/api/gemini` はその手前の 9 秒で自前の JSON エラーを返す。gemini-2.5-flash の応答は thinking 込みで 3〜8 秒かかり、余裕は小さい

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
