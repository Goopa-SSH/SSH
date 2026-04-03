# Crypto Portal Pro - PRD

## Problem Statement
Application web de suivi de cryptomonnaies en temps réel avec dashboard premium.

## Core Features
- Suivi en temps réel des prix (CoinGecko API)
- Graphiques historiques des prix (AreaChart)
- Système de favoris (localStorage)
- Portfolio tracker avec P&L
- Alertes de prix personnalisées
- Convertisseur crypto-crypto
- Toggle USD/EUR
- Statistiques globales (Market Cap, BTC/ETH dominance, Fear & Greed Index)
- Heatmap du marché (grille visuelle des performances)

## Tech Stack
React 19, Tailwind CSS, Shadcn/UI, Recharts, Lucide-react, FastAPI, Motor (MongoDB async), CoinGecko API, alternative.me API

## Architecture (post-refactoring 2026-04-02)
```
/app/
├── backend/
│   ├── server.py
│   └── tests/test_crypto_api.py
├── frontend/src/
│   ├── App.js (279 lines - slim orchestrator)
│   ├── hooks/
│   │   ├── useCryptoData.js (markets, trending, global, chart)
│   │   ├── usePortfolio.js (CRUD)
│   │   ├── useAlerts.js (CRUD)
│   │   └── useFavorites.js (localStorage)
│   ├── components/
│   │   ├── GlobalStatsBar.jsx (stats ticker)
│   │   ├── MarketHeatmap.jsx (treemap)
│   │   ├── CryptoRow.jsx (market row)
│   │   ├── ChartDialog.jsx (price chart modal)
│   │   ├── AlertDialog.jsx (alert creation)
│   │   ├── PortfolioDialog.jsx (portfolio add)
│   │   ├── PortfolioManager.jsx (portfolio tab)
│   │   ├── AlertsManager.jsx (alerts tab)
│   │   ├── ConverterTab.jsx (converter)
│   │   ├── TrendingTab.jsx (trending)
│   │   ├── PriceChange.jsx (shared)
│   │   └── ui/ (shadcn)
│   └── utils/
│       ├── formatters.js (number formatting)
│       └── logger.js (conditional logging)
```

## Code Quality Fixes Applied (2026-04-02)
- [x] Missing hook dependencies → useCallback + proper dep arrays
- [x] Mutable default argument (server.py) → None + runtime init
- [x] Massive component (919→279 lines) → extracted 11 components + 4 hooks
- [x] Index as key → stable keys (skeleton-${i})
- [x] Console statements → conditional logger utility
- [x] Inline objects → extracted to constants
- [x] use-toast.js deps → fixed to empty array

## API Endpoints
- GET /api/crypto/markets, /trending, /chart/{id}, /convert, /search, /price/{id}
- GET /api/crypto/global, /api/crypto/fear-greed
- CRUD /api/portfolio, /api/alerts

## Backlog
- P1: Graphiques en chandelier (candlestick)
- P1: Notifications navigateur pour alertes
- P2: Comparateur de cryptos côte à côte
- P2: Export portfolio CSV/PDF
- P2: Mode sombre/clair toggle
- P2: Multi-devises (GBP, JPY, CHF)
