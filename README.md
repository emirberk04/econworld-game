# EconWorld

A text-based, multiplayer, real-time economy web game. Think Bloomberg terminal meets browser game.

## Stack

- **Frontend** — React + Vite + TypeScript
- **Backend** — Node.js + Express + TypeScript
- **Database** — PostgreSQL 17
- **State** — Zustand (with localStorage persistence)
- **Auth** — JWT (access 15m + refresh 7d)

## Features (so far)

- Player registration & login
- JWT-based session management
- Dashboard with live balance display
- Daily login bonus (50◈/day, race-condition safe)
- Transaction history log

## Getting Started

```bash
# Prerequisites: Node.js 18+, PostgreSQL 17

# 1. Clone & install
git clone https://github.com/emirberk04/econworld-game.git
cd econworld-game
npm install

# 2. Set up environment
cp .env.example server/.env
# Fill in DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET in server/.env

# 3. Create PostgreSQL database
createdb econworld

# 4. Run (starts both client :5173 and server :3001)
npm run dev
```

## Roadmap

- [x] Phase 1 — Auth & Player Identity
- [x] Phase 2 — Economy Infrastructure (balance, transactions, daily bonus)
- [ ] Phase 3 — Profession System (5 professions, XP, leveling)
- [ ] Phase 4 — Production Chain
- [ ] Phase 5 — Live Market & Exchange
- [ ] Phase 6 — Banking System
- [ ] Phase 7 — Companies & Government
- [ ] Phase 8 — PvP Economic Warfare
- [ ] Phase 9 — Premium & Monetization
- [ ] Phase 10 — Mobile (Capacitor)
