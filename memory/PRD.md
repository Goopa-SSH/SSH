# Crypto Portal Pro — PRD

## Problem Statement
Application SaaS de suivi crypto en temps réel avec données CoinGecko, gestion de portfolio, alertes de prix, comparateur, et outils d'analyse de marché.

## Architecture
- **Frontend**: React + Tailwind CSS + Shadcn/UI
- **Backend**: FastAPI + MongoDB (Motor async)
- **APIs externes**: CoinGecko (données marché), Alternative.me (Fear & Greed Index)

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
12. Export portfolio CSV/PDF
13. Mode sombre/clair toggle

## Implemented Features (as of April 2026)
- [x] Dashboard 50 cryptos en temps réel
- [x] Multi-devises (USD, EUR, GBP, JPY, CHF)
- [x] Heatmap du marché
- [x] Graphiques candlestick + ligne
- [x] Portfolio manuel
- [x] Alertes de prix avec notifications navigateur
- [x] Convertisseur de cryptos
- [x] Tendances (trending)
- [x] Comparateur de cryptos côte à côte
- [x] Bannière Coinbase
- [x] Stats globales + Fear & Greed Index
- [x] Refactoring modulaire (composants + hooks)
- [x] Rate limit resilience (stale cache fallback, staggered requests)
- [x] Export portfolio CSV/PDF
- [x] Mode sombre/clair toggle (persiste dans localStorage)

## Prioritized Backlog
### P0
- [ ] Intégration API Coinbase (portfolio réel) — EN ATTENTE clé ECDSA de l'utilisateur

### P2
- Toutes les tâches P2 complétées

## Key API Endpoints
- `GET /api/crypto/markets` — Top cryptos
- `GET /api/crypto/ohlc/{crypto_id}` — OHLC candlestick
- `GET /api/crypto/global` — Stats globales
- `GET /api/crypto/fear-greed` — Fear & Greed
- `GET /api/crypto/trending` — Tendances
- `GET /api/crypto/convert` — Conversion
- `GET /api/crypto/chart/{crypto_id}` — Historique prix
- `GET /api/crypto/search` — Recherche
- `GET /api/alerts/check` — Vérification alertes
- `GET /api/portfolio/export/csv` — Export CSV
- `GET /api/portfolio/export/pdf` — Export PDF
- CRUD: `/api/portfolio`, `/api/alerts`

## DB Schema
- `portfolio`: `{id, crypto_id, crypto_name, crypto_symbol, amount, purchase_price, timestamp}`
- `alerts`: `{id, crypto_id, crypto_name, crypto_symbol, target_price, condition, active, timestamp}`

## Technical Notes
- CoinGecko free tier: ~10-30 req/min. Backend: 90s cache + stale fallback on 429
- Frontend staggers API calls (0s, 1s, 2s, 3s, 5s delays)
- Theme system: CSS custom properties, `data-theme` on html, persisted in localStorage
- PDF export via reportlab, CSV via stdlib
