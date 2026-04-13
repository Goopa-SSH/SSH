# Crypto Portal Pro - PRD

## Problem Statement
Application web de suivi de cryptomonnaies en temps réel avec dashboard premium.

## Core Features
- Suivi en temps réel des prix (CoinGecko API)
- Graphiques historiques (AreaChart + Candlestick OHLC)
- Système de favoris (localStorage)
- Portfolio tracker avec P&L
- Alertes de prix avec notifications navigateur
- Convertisseur crypto-crypto
- Multi-devises (USD, EUR, GBP, JPY, CHF)
- Statistiques globales (Market Cap, BTC/ETH dominance, Fear & Greed)
- Heatmap du marché
- Lien d'affiliation Coinbase

## Tech Stack
React 19, Tailwind CSS, Shadcn/UI, Recharts, Lucide-react, FastAPI, Motor (MongoDB async), CoinGecko API, alternative.me API

## Architecture
```
/app/
├── backend/
│   ├── server.py
│   └── tests/test_crypto_api.py
├── frontend/src/
│   ├── App.js (orchestrator)
│   ├── hooks/
│   │   ├── useMarketData.js, useGlobalStats.js, useChartData.js
│   │   ├── usePortfolio.js, useAlerts.js, useFavorites.js
│   │   └── useNotifications.js (browser notifications)
│   ├── components/
│   │   ├── CandlestickChart.jsx (custom SVG OHLC chart)
│   │   ├── AffiliateBar.jsx (Coinbase referral)
│   │   ├── GlobalStatsBar.jsx, MarketHeatmap.jsx, CryptoRow.jsx
│   │   ├── ChartDialog.jsx (line/candlestick toggle)
│   │   ├── AlertDialog.jsx, PortfolioDialog.jsx
│   │   ├── AlertsManager.jsx, PortfolioManager.jsx, PortfolioItem.jsx
│   │   ├── ConverterTab.jsx, ConversionResult.jsx, TrendingTab.jsx
│   │   ├── SummaryCards.jsx, PriceChange.jsx
│   │   └── ui/ (shadcn)
│   └── utils/
│       ├── formatters.js
│       └── logger.js
```

## API Endpoints
- GET /api/crypto/markets, /trending, /chart/{id}, /convert, /search, /price/{id}
- GET /api/crypto/global, /api/crypto/fear-greed
- GET /api/crypto/ohlc/{id} (NEW - candlestick data)
- GET /api/alerts/check (NEW - triggered alerts for notifications)
- CRUD /api/portfolio, /api/alerts

## Backlog
- P1: Intégration API Coinbase (portfolio réel)
- P2: Comparateur de cryptos côte à côte
- P2: Export portfolio CSV/PDF
