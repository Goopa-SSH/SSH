# Crypto Portal Pro — PRD

## Problem Statement
Application SaaS de suivi crypto en temps réel avec données CoinGecko, gestion de portfolio manuel, alertes de prix, et outils d'analyse de marché.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB (Motor async)
- **APIs externes**: CoinGecko (données marché), Alternative.me (Fear & Greed Index)
- **Stack path**: `/app/frontend/src/` et `/app/backend/server.py`

## Core Requirements
1. Dashboard avec top 50 cryptos, prix en temps réel, variations 24h
2. Support multi-devises (USD, EUR, GBP, JPY, CHF)
3. Heatmap du marché (performance 24h par capitalisation)
4. Graphiques en chandelier (candlestick/OHLC) + graphiques ligne
5. Portfolio manuel (ajout/suppression de positions)
6. Alertes de prix (navigateur push notifications)
7. Convertisseur de cryptos
8. Tendances (trending coins)
9. Comparateur de cryptos côte à côte (2-3 cryptos)
10. Bannière d'affiliation Coinbase
11. Statistiques globales du marché (market cap, volume, dominances, Fear & Greed)

## Implemented Features (as of April 2026)
- [x] Dashboard avec 50 cryptos en temps réel
- [x] Multi-devises (USD, EUR, GBP, JPY, CHF)
- [x] Heatmap du marché
- [x] Graphiques candlestick + ligne
- [x] Portfolio manuel
- [x] Alertes de prix avec notifications navigateur
- [x] Convertisseur de cryptos
- [x] Tendances (trending)
- [x] Comparateur de cryptos côte à côte (BTC vs ETH vs SOL etc.)
- [x] Bannière Coinbase
- [x] Stats globales + Fear & Greed Index
- [x] Refactoring modulaire (composants + hooks)
- [x] Rate limit resilience (stale cache fallback, staggered requests)

## Prioritized Backlog
### P0
- [ ] Intégration API Coinbase (synchronisation portfolio réel) — EN ATTENTE des clés API utilisateur

### P2
- [ ] Export portfolio CSV/PDF
- [ ] Mode sombre/clair toggle

## Key API Endpoints
- `GET /api/crypto/markets` — Top cryptos par market cap
- `GET /api/crypto/ohlc/{crypto_id}` — Données OHLC candlestick
- `GET /api/crypto/global` — Stats globales du marché
- `GET /api/crypto/fear-greed` — Index Fear & Greed
- `GET /api/crypto/trending` — Cryptos tendances
- `GET /api/crypto/convert` — Conversion entre cryptos
- `GET /api/crypto/chart/{crypto_id}` — Historique des prix
- `GET /api/crypto/search` — Recherche de cryptos
- `GET /api/alerts/check` — Vérification des alertes
- CRUD: `/api/portfolio`, `/api/alerts`

## DB Schema
- `portfolio`: `{id (UUID), crypto_id, crypto_name, crypto_symbol, amount, purchase_price, timestamp}`
- `alerts`: `{id (UUID), crypto_id, crypto_name, crypto_symbol, target_price, condition, active, timestamp}`

## Technical Notes
- CoinGecko free tier: ~10-30 req/min. Backend implements 90s cache + stale fallback on 429
- Frontend staggers API calls (0s, 1s, 2s, 3s, 5s delays) to avoid rate cascades
- React hooks follow exhaustive-deps rules
- SVG-based candlestick chart rendering (fixed-pixel approach)
