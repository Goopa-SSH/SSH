# Crypto Portal Pro - PRD

## Problem Statement
Application web de suivi de cryptomonnaies en temps réel avec dashboard premium.

## Core Features
- Suivi en temps réel des prix (CoinGecko API)
- Graphiques historiques des prix
- Système de favoris (localStorage)
- Portfolio tracker avec P&L
- Alertes de prix personnalisées
- Convertisseur crypto-crypto
- Toggle USD/EUR

## Recent Improvements (2026-04-01)
1. **Refonte UI/UX Premium** - Design obsidian noir (#050505), typographie Chivo/IBM Plex Sans/JetBrains Mono, bords nets, accents Volt Blue (#007AFF), Acid Green (#00FFAA), Signal Red (#FF3B30)
2. **Statistiques Globales du Marché** - Barre ticker avec Fear & Greed Index (alternative.me API), Market Cap total, Volume 24h, Dominance BTC/ETH, cryptos actives
3. **Heatmap du Marché** - Grille visuelle des performances 24h, cellules dimensionnées par capitalisation, colorées par variation

## Tech Stack
- Frontend: React 19, Tailwind CSS, Shadcn/UI, Recharts, Lucide-react
- Backend: FastAPI, Motor (MongoDB async), Requests
- Database: MongoDB
- APIs: CoinGecko (crypto data), alternative.me (Fear & Greed)

## Architecture
```
/app/
├── backend/
│   ├── server.py           # FastAPI + CoinGecko + MongoDB
│   └── tests/
│       └── test_crypto_api.py
├── frontend/src/
│   ├── App.js              # Main dashboard
│   ├── App.css             # Custom styles
│   ├── index.css           # CSS variables
│   └── components/
│       ├── GlobalStatsBar.jsx
│       ├── MarketHeatmap.jsx
│       └── ui/             # Shadcn components
```

## API Endpoints
- GET /api/crypto/markets - Top 50 cryptos
- GET /api/crypto/trending - Trending cryptos
- GET /api/crypto/chart/{id} - Price chart data
- GET /api/crypto/convert - Crypto conversion
- GET /api/crypto/search - Search cryptos
- GET /api/crypto/price/{id} - Detailed price
- GET /api/crypto/global - Global market stats (NEW)
- GET /api/crypto/fear-greed - Fear & Greed Index (NEW)
- CRUD /api/portfolio - Portfolio management
- CRUD /api/alerts - Price alerts management

## Known Limitations
- CoinGecko free API rate limits (429 errors) - mitigated by 60s cache
- No user authentication

## Backlog
- P1: Graphiques en chandelier (candlestick)
- P1: Notifications navigateur pour alertes
- P2: Comparateur de cryptos côte à côte
- P2: Export portfolio CSV/PDF
- P2: Mode sombre/clair toggle
- P2: Multi-devises (GBP, JPY, CHF)
