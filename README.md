# TodoQuest

TodoQuestは、タスク管理・タイマー・経験値（XP）・レベルアップ機能を組み合わせた、スマホ最適化型の成長型タスク管理Webアプリです。

## 開発サーバの起動方法

1. 依存パッケージをインストール

```bash
npm install
```

2. 開発サーバを起動

```bash
npm run dev
```

3. ブラウザで http://localhost:3000 にアクセス


## 本番デプロイ方法

1. ビルド

```bash
npm run build
```

2. 本番サーバ起動

```bash
npm start
```

- Vercel等のNext.js対応ホスティングサービスでもそのままデプロイ可能です。
- サーバ側データ（userdata.json）は永続ストレージに配置してください。

---

- 技術スタック: Next.js (App Router) + TypeScript
- サーバAPI: /api/userdata
- スマホUI・PWA対応
