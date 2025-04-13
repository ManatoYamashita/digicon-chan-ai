# でじこんちゃん.net（でじこんちゃんAI）

<div align="center">
  <img width="1259" alt="でじこんちゃんのスクリーンショット" src="https://github.com/user-attachments/assets/e61c2c65-6cf4-441d-b3cd-5ba3ee133cf8">
</div>

## 📝 概要

東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュ「でじこんちゃん」です！
Gemini APIを使用してでじこんちゃんと会話が楽しめます！でじこんちゃんは回答によって表情を変えてアニメーションします！（アニメーションは手描きです！）

このプロジェクトはNext.js 14（App Router）とTypeScriptで構築されたウェブアプリケーションで、GSAPによるアニメーションを実装しています。

[詳しい使い方はこちら！（プロモーションビデオ）](https://youtu.be/oJtXLAAvxBc?si=Tk66QbGXZwEzn52F)

## 🌐 ページ構成

* **`/`**
   * ホームページ、リンク集
* **`/about`**
   * でじこんちゃんの略歴について紹介！
* **`/talk`**
   * でじこんちゃんAIとお話ししよう！（Gemini APIを使用してコンテキストを考慮した会話が可能です）

## ✨ 特徴

<div align="center">
  <img width="500" alt="でじこんちゃん" src="https://github.com/user-attachments/assets/3521e9da-84c9-41bd-bbe9-cb1ae32fa069">
</div>

- ユーザーがプロンプトを入力できます
- アプリがGemini APIにプロンプトを送信します
- Gemini APIからのレスポンスを表示します
- 回答に応じたでじこんちゃんのアニメーションが楽しめます

## 🚀 始め方

### 前提条件

以下がマシンにインストールされていることを確認してください：

- [Node.js](https://nodejs.org/) (v14以降)
- [npm](https://www.npmjs.com/) (v6以降)

### インストール

1. リポジトリをクローンする：

   ```sh
   git clone https://github.com/ManatoYamashita/dcchan-ai.git
   cd dcchan-ai
   ```

2. 依存関係をインストールする：

   ```sh
   npm install
   ```

3. プロジェクトのルートに`.env.local`ファイルを作成し、Gemini APIキーを追加する：

   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```

### アプリの実行

開発サーバーを起動するには、次のコマンドを実行します：

```sh
npm run dev
```

ブラウザを開き、`http://localhost:3000`にアクセスしてアプリケーションを確認できます。

## 📦 デプロイ

アプリをビルドしてデプロイするには、次のコマンドを実行します：

```sh
npm run build
npm run start
```

デプロイ環境に`GEMINI_API_KEY`環境変数が設定されていることを確認してください。

## 📄 ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。詳細はLICENSEファイルをご覧ください。

## 🙏 謝辞

* Next.js (v14: App Router)
* TypeScript
* Gemini API
* GSAP
* SASS
* Vercel

## 🤝 貢献

問題や機能リクエストの提出は歓迎します。

## 📧 連絡先

山下 愛斗 - g2172117[at]tcu.ac.jp

プロジェクトリンク: [https://github.com/ManatoYamashita/dcchan-ai](https://github.com/ManatoYamashita/dcchan-ai)
