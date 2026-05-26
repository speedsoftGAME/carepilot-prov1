# Guide de démarrage Claude Code — CarePilot Pro

## Ce que tu dois avoir sur ton PC

- [ ] Node.js v18+ → https://nodejs.org (prends la version LTS)
- [ ] Docker Desktop → https://www.docker.com/products/docker-desktop
- [ ] Git → https://git-scm.com
- [ ] Claude Code installé → `npm install -g @anthropic-ai/claude-code`
- [ ] Un abonnement Claude Pro ou Max

---

## Étape 1 — Préparer le dossier

Crée un dossier sur ton bureau :

```
Bureau/
└── carepilot-pro/
    ├── CLAUDE.md              ← téléchargé depuis claude.ai
    ├── setup.sh               ← téléchargé depuis claude.ai
    └── carepilot_pro.html     ← téléchargé depuis claude.ai
```

---

## Étape 2 — Ouvrir le terminal

**Windows :** Clic droit sur le dossier → "Ouvrir dans le terminal"
**Mac :** Clic droit → "Nouveau terminal au dossier"

---

## Étape 3 — Lancer le script de setup

```bash
bash setup.sh
```

Ce script installe automatiquement toutes les dépendances (2-3 minutes).

---

## Étape 4 — Démarrer PostgreSQL

```bash
docker-compose up -d
```

Tu dois voir : `✔ Container postgres Started`

---

## Étape 5 — Lancer Claude Code

```bash
claude
```

La première fois, il t'ouvre le navigateur pour te connecter à ton compte Anthropic. 
Tu cliques "Autoriser" et c'est bon.

---

## Étape 6 — Le message de démarrage

Une fois dans Claude Code, colle exactement ce message :

```
Lis le fichier CLAUDE.md en entier.

Ensuite démarre la Phase 1, Étape 1 :
- Initialise Prisma avec le schéma complet du CLAUDE.md
- Crée le fichier backend/.env avec les bonnes valeurs pour le dev local
- Lance la migration pour créer toutes les tables
- Crée le fichier seed.js avec les données de test décrites dans le CLAUDE.md
- Lance le seed pour peupler la base

Explique-moi chaque fichier que tu crées et ce qu'il fait.
```

---

## Commandes utiles pendant le développement

```bash
# Voir les données en temps réel (interface graphique PostgreSQL)
cd backend && npx prisma studio

# Réinitialiser la base si besoin
cd backend && npx prisma migrate reset

# Démarrer backend + frontend en même temps
# Terminal 1 :
cd backend && npm run dev

# Terminal 2 :
cd frontend && npm run dev

# Voir les logs PostgreSQL
docker-compose logs postgres
```

---

## Si quelque chose ne marche pas

Dis à Claude Code exactement ce que tu vois comme erreur.
Il trouvera et corrigera lui-même.

---

## Progression attendue

| Semaine | Ce qui sera prêt |
|---------|-----------------|
| 1 | Base de données + Auth + Missions |
| 2 | Véhicules + Dispatch IA + OKCare |
| 3 | Paiement Stripe + tous les panels |
| 4 | Tests + Deploy + premiers clients |

