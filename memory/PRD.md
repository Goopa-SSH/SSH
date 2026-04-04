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
- Heatmap du marché

## Tech Stack
React 19, Tailwind CSS, Shadcn/UI, Recharts, Lucide-react, FastAPI, Motor (MongoDB async), CoinGecko API, alternative.me API

## Architecture (post-refactoring v2 — 2026-04-04)
```
/app/
├── backend/
│   ├── server.py
│   └── tests/test_crypto_api.py
├── frontend/src/
│   ├── App.js (276 lines - slim orchestrator)
│   ├── hooks/
│   │   ├── useMarketData.js   (markets + trending)
│   │   ├── useGlobalStats.js  (global + fear&greed)
│   │   ├── useChartData.js    (chart fetching)
│   │   ├── usePortfolio.js    (CRUD)
│   │   ├── useAlerts.js       (CRUD)
│   │   └── useFavorites.js    (localStorage)
│   ├── components/
│   │   ├── GlobalStatsBar.jsx  (stats ticker)
│   │   ├── MarketHeatmap.jsx   (treemap)
│   │   ├── CryptoRow.jsx       (market row)
│   │   ├── SummaryCards.jsx    (dashboard cards)
│   │   ├── ChartDialog.jsx     (price chart modal)
│   │   ├── AlertDialog.jsx     (alert creation)
│   │   ├── AlertsManager.jsx   (alerts tab)
│   │   ├── PortfolioDialog.jsx (portfolio add)
│   │   ├── PortfolioManager.jsx(portfolio tab)
│   │   ├── PortfolioItem.jsx   (single item)
│   │   ├── ConverterTab.jsx    (converter)
│   │   ├── ConversionResult.jsx(result display)
│   │   ├── TrendingTab.jsx     (trending)
│   │   ├── PriceChange.jsx     (shared)
│   │   └── ui/                 (shadcn)
│   └── utils/
│       ├── formatters.js       (number formatting)
│       └── logger.js           (conditional logging)
```

## Code Quality Fixes Applied

### Round 1 (2026-04-02)
- Massive component split (919→279 lines)
- Initial hook dependency fixes
- Mutable default argument (Python)
- Console statements → conditional logger
- Inline objects → extracted constants

### Round 2 (2026-04-04)
- Split useCryptoData → useMarketData + useGlobalStats + useChartData
- Extract SummaryCards, PortfolioItem, ConversionResult sub-components
- ConverterTab: CryptoSelect extracted, ConversionResult extracted
- PortfolioManager: PortfolioItem extracted
- App.js callback deps: state setters explicitly listed
- Python `== True` → direct boolean check
- Logger: eslint-disable + prod no-op pattern
- Max component size: 108 lines (MarketHeatmap)

## Backlog
- P1: Graphiques en chandelier (candlestick)
- P1: Notifications navigateur pour alertes
- P2: Comparateur de cryptos côte à côte
- P2: Export portfolio CSV/PDF
- P2: Mode sombre/clair toggle
- P2: Multi-devises (GBP, JPY, CHF)
