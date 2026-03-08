# でじこんちゃん.net（でじこんちゃんAI）

<div align="center">
  <img width="1259" alt="でじこんちゃんのスクリーンショット" src="https://github.com/user-attachments/assets/e61c2c65-6cf4-441d-b3cd-5ba3ee133cf8">
</div>

## 概要

東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュ「でじこんちゃん」です！
Gemini APIを使用してでじこんちゃんと会話が楽しめます！でじこんちゃんは回答によって表情を変えてアニメーションします！（アニメーションは手描きです！）

このプロジェクトはNext.js 16（App Router + Turbopack）とReact 19、TypeScriptで構築されたウェブアプリケーションで、GSAPやframer-motion、View Transitions APIによるリッチなアニメーションを実装しています。

[詳しい使い方はこちら！（プロモーションビデオ）](https://youtu.be/oJtXLAAvxBc?si=Tk66QbGXZwEzn52F)

## ページ構成

* **`/`**
   * ホームページ、リンク集
* **`/about`**
   * でじこんちゃんの略歴について紹介！
* **`/chat`**
   * でじこんちゃんAIとチャットしよう！（Gemini APIを使用したセッション管理付きチャットUI。感情表現アニメーションやCmd+Enterでの送信に対応）

## 特徴

<div align="center">
  <img width="500" alt="でじこんちゃん" src="https://github.com/user-attachments/assets/3521e9da-84c9-41bd-bbe9-cb1ae32fa069">
</div>

- Gemini APIによるコンテキストを考慮した会話
- セッション管理によるチャット履歴の保持
- 回答の感情に応じたでじこんちゃんのアニメーション表現
- Cmd+Enter（Ctrl+Enter）でのメッセージ送信
- GSAPとframer-motionによるリッチなページアニメーション
- View Transitions APIによるページ遷移アニメーション

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router + Turbopack) |
| UI | React 19 |
| 言語 | TypeScript 5 |
| AI | Gemini API |
| アニメーション | GSAP 3, framer-motion 12, View Transitions API |
| スタイル | Sass (SCSS Modules) |
| デプロイ | Vercel |
| パッケージマネージャ | pnpm |

## 始め方

### 前提条件

以下がマシンにインストールされていることを確認してください：

- [Node.js](https://nodejs.org/) (v18以降)
- [pnpm](https://pnpm.io/) (v9以降)

### インストール

1. リポジトリをクローンする：

   ```sh
   git clone https://github.com/ManatoYamashita/digicon-chan-ai.git
   cd digicon-chan-ai
   ```

2. 依存関係をインストールする：

   ```sh
   pnpm install
   ```

3. プロジェクトのルートに`.env.local`ファイルを作成し、Gemini APIキーを追加する：

   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```

### アプリの実行

開発サーバーを起動するには、次のコマンドを実行します：

```sh
pnpm dev
```

ブラウザを開き、`http://localhost:3000`にアクセスしてアプリケーションを確認できます。

## デプロイ

アプリをビルドしてデプロイするには、次のコマンドを実行します：

```sh
pnpm build
pnpm start
```

デプロイ環境に`GEMINI_API_KEY`環境変数が設定されていることを確認してください。

## ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。詳細はLICENSEファイルをご覧ください。

## 謝辞

* Next.js (v16: App Router + Turbopack)
* React 19
* TypeScript
* Gemini API
* GSAP
* framer-motion
* View Transitions API
* Sass
* Vercel

## 貢献

問題や機能リクエストの提出は歓迎します。

## 連絡先

山下マナト - g2172117[at]tcu.ac.jp

プロジェクトリンク: [https://github.com/ManatoYamashita/digicon-chan-ai](https://github.com/ManatoYamashita/digicon-chan-ai)
