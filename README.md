# マインスイーパー Next.js

このプロジェクトは、Next.js、React、TypeScriptを使用して開発されたモダンなマインスイーパーゲームです。

## 機能

- 初級、中級、上級の3つの難易度レベル
- カスタム難易度設定
- モバイル対応のタッチコントロール
- ダークモード対応
- アクセシビリティを考慮したUI

## 開発環境のセットアップ

まず、開発サーバーを実行します：

```bash
npm install
npm run dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開くとゲームが表示されます。

## ビルドと本番環境

本番環境用にビルドするには：

```bash
npm run build
npm start
```

## Vercelへのデプロイ

このプロジェクトはVercelに最適化されています。デプロイするには次の手順に従ってください：

1. [Vercel](https://vercel.com) アカウントを作成（まだ持っていない場合）
2. GitHubリポジトリとVercelアカウントを連携
3. Vercelダッシュボードから「New Project」をクリック
4. このリポジトリを選択し、「Import」をクリック
5. 設定は自動的に検出されますので、そのまま「Deploy」をクリック

### 注意事項

- ESLintのルールに厳格に従ってコードを記述する必要があります
- React Hooksのルールに特に注意してください（条件付き呼び出しは避ける）

## デプロイ済みのデモ

デプロイ済みのマインスイーパーゲームは以下のURLで確認できます：
[マインスイーパー デモ](https://minesweeper-nextjs-nnno.vercel.app/)

## テクノロジー

- Next.js 15.3.0
- React
- TypeScript
- TailwindCSS