# Wealth Pilot

[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel)](https://wealth-pilot.craftgarden.studio)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)

個人資産管理・投資トラッキングダッシュボード。ポートフォリオの一元管理、Yahoo Finance API によるリアルタイム株価取得、インタラクティブなチャートによる資産推移の可視化を提供します。

**URL**: https://wealth-pilot.craftgarden.studio

![Wealth Pilot](screenshot.png)

## Features

- **資産ダッシュボード** -- 総資産、配分比率、パフォーマンスを一画面で可視化
- **株式ポートフォリオ管理** -- 保有銘柄の追加・編集・損益計算
- **Yahoo Finance 連携** -- リアルタイム株価・配当情報の自動取得
- **インタラクティブチャート** -- Recharts による資産推移・配分グラフ
- **配当トラッカー** -- 配当金の記録・年間集計・利回り計算
- **税金最適化** -- 税金シミュレーション・最適化提案
- **AI アドバイザー** -- 投資に関する AI チャットアドバイザー
- **アニメーション UI** -- Framer Motion によるスムーズなトランジション

## Why / Background

個人の資産状況を一元的に把握するため、複数の証券口座や資産クラスを横断的に管理できるダッシュボードが必要でした。Wealth Pilot は Yahoo Finance API と連携して最新の市場データを取得し、ポートフォリオ全体の健全性を可視化します。

## Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS 4, Radix UI, Framer Motion |
| Language | TypeScript |
| Database | Turso (libSQL) |
| ORM | Prisma (with @prisma/adapter-libsql) |
| Charts | Recharts |
| Market Data | yahoo-finance2 |
| Deploy | Vercel |

## Getting Started

### Prerequisites

- Node.js >= 20
- pnpm
- Turso CLI（DB 管理用）

### Installation

```bash
git clone https://github.com/ksato8710/wealth-pilot.git
cd wealth-pilot
pnpm install
pnpm dev
```

### Environment Variables

```bash
cp .env.example .env.local
# 以下の値を設定:
# TURSO_DATABASE_URL   -- Turso DB URL
# TURSO_AUTH_TOKEN     -- Turso 認証トークン
# DATABASE_URL         -- Prisma 用 DB URL
```

### Database Setup

```bash
# Prisma クライアント生成 & マイグレーション
npx prisma generate
npx prisma db push
```

## Architecture

### Directory Structure

```
wealth-pilot/
├── src/
│   ├── app/
│   │   ├── page.tsx               # ランディングページ
│   │   ├── layout.tsx             # ルートレイアウト
│   │   ├── dashboard/             # 資産ダッシュボード
│   │   ├── portfolio/             # ポートフォリオ管理
│   │   ├── dividends/             # 配当トラッカー
│   │   ├── tax-optimizer/         # 税金最適化
│   │   ├── ai-advisor/            # AI アドバイザー
│   │   ├── settings/              # 設定ページ
│   │   └── api/
│   │       ├── holdings/          # 保有銘柄 API
│   │       ├── portfolio/         # ポートフォリオ API
│   │       ├── dividends/         # 配当 API
│   │       ├── sync/              # 株価同期 API
│   │       ├── chat/              # AI チャット API
│   │       └── settings/          # 設定 API
│   ├── components/
│   │   ├── ui/                    # 共通 UI コンポーネント
│   │   ├── dashboard/             # ダッシュボードウィジェット
│   │   ├── portfolio/             # ポートフォリオ関連 UI
│   │   ├── landing/               # ランディングページ
│   │   ├── chat/                  # AI チャット UI
│   │   ├── settings/              # 設定 UI
│   │   ├── layout/                # レイアウト（サイドバー等）
│   │   └── skeletons/             # ローディングスケルトン
│   ├── hooks/                     # カスタム React Hooks
│   ├── lib/
│   │   └── server/
│   │       └── services/          # サーバーサイドビジネスロジック
│   └── data/
│       └── mock-data.ts           # モックデータ
├── prisma/
│   └── schema.prisma              # Prisma スキーマ定義
├── public/                        # 静的ファイル
├── package.json
└── tsconfig.json
```

### Key Files

| Path | Role |
|------|------|
| `prisma/schema.prisma` | データモデル定義（Holdings, Dividends, Portfolio 等） |
| `src/lib/server/services/` | Yahoo Finance API 連携、損益計算ロジック |
| `src/hooks/` | データフェッチ・状態管理カスタム Hooks |
| `src/components/dashboard/` | チャート・統計ウィジェット |
| `src/app/api/sync/` | Yahoo Finance からの株価同期 API |

### Data Flow

```
Yahoo Finance API
    |
    v
API Routes (sync)  ->  Turso DB (Prisma)
    |
    v
Server Components  ->  Dashboard / Charts (Recharts)
```

## Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | 開発サーバー起動 |
| `pnpm build` | Prisma generate + プロダクションビルド |
| `pnpm start` | プロダクションサーバー起動 |
| `pnpm lint` | ESLint 実行 |
| `npx prisma generate` | Prisma クライアント生成 |
| `npx prisma db push` | DB スキーマ適用 |
| `npx prisma studio` | Prisma Studio 起動（DB GUI） |

## Deploy

Vercel にデプロイ。ビルド時に `prisma generate` が自動実行されます。

- **本番 URL**: https://wealth-pilot.craftgarden.studio
- **ブランチ**: `main`
- **ビルドコマンド**: `prisma generate && next build`

## Related Projects

- [product-hub](https://github.com/ksato8710/product-hub) -- プロダクトエコシステム管理ハブ
- [ai-pm-service](https://github.com/ksato8710/ai-pm-service) -- AI 支援タスク管理
- [craftgarden-studio](https://github.com/ksato8710/craftgarden-studio) -- コーポレートサイト

## Changelog

| Date | Change |
|------|--------|
| 2026-02 | AI アドバイザー機能追加、Framer Motion アニメーション |
| 2026-02 | 配当トラッカー・税金最適化ページ追加 |
| 2026-01 | 初期リリース -- ポートフォリオ管理・Yahoo Finance 連携 |

## Roadmap

- [ ] 複数通貨（USD/JPY）対応
- [ ] 資産クラス別パフォーマンス分析
- [ ] 投資目標設定・進捗トラッキング
- [ ] 自動リバランス提案
- [ ] CSV インポート / エクスポート

## Contributing

Issue・Pull Request 歓迎です。Prisma スキーマ変更時は `npx prisma generate` を実行してください。

## License

MIT
