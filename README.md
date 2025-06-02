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

## Apacheでの本番運用例

Next.jsアプリをApacheで本番運用する場合、リバースプロキシ設定が必要です。

1. Apacheのmod_proxy, mod_proxy_httpを有効化

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo systemctl restart apache2
```

2. サイト設定例（/etc/apache2/sites-available/todoquest.conf など）

```
<VirtualHost *:80>
    ServerName your-domain.example.com
    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/
    ErrorLog ${APACHE_LOG_DIR}/todoquest_error.log
    CustomLog ${APACHE_LOG_DIR}/todoquest_access.log combined
</VirtualHost>
```

3. サイト有効化＆Apache再起動

```bash
sudo a2ensite todoquest.conf
sudo systemctl reload apache2
```

- Next.jsアプリは `npm run build && npm start` で3000番ポートで起動しておくこと
- SSL利用時はLet's Encrypt等でHTTPS設定を追加してください

- 技術スタック: Next.js (App Router) + TypeScript
- サーバAPI: /api/userdata
- スマホUI・PWA対応
