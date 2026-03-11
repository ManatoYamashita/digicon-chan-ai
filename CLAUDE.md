# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

「でじこんちゃん.net」- 東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュ「でじこんちゃん」とチャットできるWebアプリケーション。Gemini APIによるAIチャット機能と、感情表現アニメーションを備える。

## 開発コマンド

```bash
pnpm dev          # 開発サーバー起動 (localhost:3000, Turbopack使用)
pnpm build        # 本番ビルド
pnpm start        # 本番サーバー起動
pnpm lint         # ESLint実行 (app/ components/ 対象)
```

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
- インメモリレート制限（8 RPM、スライディングウィンドウ）
- リトライ（429/503時、エクスポネンシャルバックオフ、最大2回）
- システムプロンプトにキャラクター設定を埋め込み

### セッション制限

チャットは最大5メッセージまで送信可能。その後リセットが必要。送信は Cmd+Enter (Mac) / Ctrl+Enter (Windows)。

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

## コミットメッセージ規則

```
PREFIX: 説明文（日本語）
```

PREFIX例: `FEAT`, `FIX`, `DOCS`, `REFACTOR` など
