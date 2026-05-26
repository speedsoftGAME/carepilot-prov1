# 🚑 CarePilot Pro

> Plateforme SaaS de régulation et dispatch ambulancier intelligente pour le marché français.

---

## 📋 Description

CarePilot Pro est un outil de régulation ambulancière tout-en-un destiné aux sociétés d'ambulances françaises. Il permet de gérer en temps réel les missions, la flotte de véhicules, les équipes et la facturation, avec un assistant IA intégré (OKCare) pour optimiser le dispatch.

---

## ✨ Fonctionnalités

| Module | Description |
|--------|-------------|
| 🚑 **Missions** | Création, suivi et dispatch des transports en temps réel |
| 🤖 **Dispatch IA** | Affectation automatique du véhicule le plus proche via Claude AI |
| 🗺️ **Carte GPS** | Positions des véhicules en temps réel (Leaflet + OpenStreetMap) |
| 🎤 **OKCare IA** | Assistant de régulation conversationnel (Anthropic Claude) |
| 🚨 **Élisa SAMU** | Interface de réception des appels SAMU 15 |
| ⏱️ **Pointeuse** | Saisie PIN pour pointage entrée/sortie des équipes |
| 👤 **Patients** | Fiches patients complètes (NSS, mutuelle, DDN) |
| 🧾 **Facturation** | Bons de transport et suivi du CA |
| 📅 **Planning RH** | Grille semaine + gestion des heures |
| 📆 **J+1** | Préparation et dispatch automatique du lendemain |

---

## 🏗️ Stack technique

```
Frontend   : React 18 + Vite + TailwindCSS
Backend    : Node.js + Express
Base de données : PostgreSQL + Prisma ORM
Auth       : JWT + bcrypt
Maps       : Leaflet.js + OpenStreetMap + Nominatim
IA         : Anthropic API (claude-sonnet-4-5)
Paiement   : Stripe
Temps réel : Socket.io
Deploy     : Railway (backend) + Vercel (frontend)
```

---

## 💼 Plans tarifaires

| Plan | Prix | Véhicules | OKCare IA |
|------|------|-----------|-----------|
| Starter | 149€/mois | 3 max | 50 msg/mois |
| Pro | 299€/mois | Illimité | 500 msg/mois |
| Enterprise | Sur devis | Illimité | Illimité |

---

## 🚀 Installation (développement)

### Prérequis
- Node.js v18+
- Docker Desktop
- Git

### Démarrage rapide

```bash
# 1. Cloner le projet
git clone https://github.com/speedsoftGAME/carepilot-pro
cd carepilot-pro

# 2. Lancer PostgreSQL
docker-compose up -d

# 3. Installer et démarrer le backend
cd backend
npm install
cp .env.example .env   # Remplir les clés API
npx prisma migrate dev
npm run db:seed
npm run dev            # API sur http://localhost:3001

# 4. Installer et démarrer le frontend
cd ../frontend
npm install
npm run dev            # App sur http://localhost:5173
```

---

## 🗂️ Structure du projet

```
carepilot-pro/
├── frontend/          # React + Vite
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       ├── api/
│       └── store/
├── backend/           # Node.js + Express
│   └── src/
│       ├── routes/
│       ├── middleware/
│       └── prisma/
├── CLAUDE.md          # Instructions pour Claude Code
├── docker-compose.yml
└── README.md
```

---

## 🔐 Variables d'environnement

```bash
# backend/.env
DATABASE_URL="postgresql://carepilot:carepilot123@localhost:5432/carepilot_pro"
JWT_SECRET="your_secret"
ANTHROPIC_API_KEY="sk-ant-..."
STRIPE_SECRET_KEY="sk_test_..."
PORT=3001

# frontend/.env
VITE_API_URL="http://localhost:3001"
VITE_STRIPE_PUBLIC_KEY="pk_test_..."
```

---

## 🗺️ Roadmap

- [x] Application HTML prototype (v1)
- [ ] Migration React + Node.js + PostgreSQL (v2)
- [ ] GPS temps réel via WebSocket
- [ ] App mobile ambulancier (PWA)
- [ ] Signature électronique patient
- [ ] Export PDF bons de transport (Cerfa)
- [ ] Intégration SAMU réelle
- [ ] Multi-sites

---

## 📍 Zone géographique de référence

Voiron / Grenoble — Isère (38), France
Coordonnées : 45.1880°N, 5.7244°E

---

## 👨‍💻 Développé avec

- [Claude AI](https://claude.ai) — Anthropic
- [React](https://react.dev)
- [Leaflet](https://leafletjs.com)
- [Prisma](https://prisma.io)
- [Stripe](https://stripe.com)

---

*CarePilot Pro — La régulation ambulancière réinventée* 🚑
