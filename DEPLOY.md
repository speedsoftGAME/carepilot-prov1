# Guide de déploiement CarePilot Pro

Ce guide explique comment mettre en production CarePilot Pro étape par étape.
Le backend tourne sur **Railway**, le frontend sur **Vercel**.

---

## Prérequis

- Un compte [Railway](https://railway.app) (gratuit pour commencer)
- Un compte [Vercel](https://vercel.com) (gratuit)
- Le dépôt GitHub de CarePilot Pro lié à ton compte
- Les clés API : Anthropic, Stripe

---

## 1. Déploiement du Backend sur Railway

### Étape 1 — Créer un projet Railway

1. Va sur [railway.app](https://railway.app) et connecte-toi
2. Clique sur **"New Project"**
3. Choisis **"Deploy from GitHub repo"**
4. Sélectionne le dépôt `carepilot-pro`

### Étape 2 — Ajouter la base de données PostgreSQL

1. Dans ton projet Railway, clique sur **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway crée automatiquement la base et fournit la variable `DATABASE_URL`
3. Cette variable est automatiquement partagée avec ton service backend

### Étape 3 — Configurer le service backend

Railway utilise le fichier `railway.json` à la racine du dépôt. La configuration est déjà prête :

- **Build** : installe les dépendances et génère le client Prisma
- **Start** : exécute les migrations puis démarre le serveur
- **Health check** : surveille l'endpoint `/health`

Si Railway ne détecte pas automatiquement la bonne configuration, vérifie dans les paramètres du service que le **Root Directory** est bien `/` (racine, pas `/backend`), car `railway.json` gère le `cd backend` lui-même.

### Étape 4 — Ajouter les variables d'environnement

Dans Railway → ton service → onglet **"Variables"**, ajoute :

| Variable | Valeur | Description |
|---|---|---|
| `DATABASE_URL` | *(auto, fourni par Railway PostgreSQL)* | URL de connexion à la BDD |
| `JWT_SECRET` | `une_chaine_aleatoire_longue_et_secrete` | Clé de signature des tokens JWT |
| `ANTHROPIC_API_KEY` | `sk-ant-...` | Clé API Anthropic (IA) |
| `STRIPE_SECRET_KEY` | `sk_live_...` | Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` | Secret webhook Stripe (voir section 5) |
| `PORT` | `3001` | Port d'écoute (Railway peut le surcharger) |
| `NODE_ENV` | `production` | Mode production |

> **Conseil sécurité** : Le `JWT_SECRET` doit être une chaîne aléatoire d'au moins 32 caractères. Génère-en un avec : `openssl rand -base64 32`

### Étape 5 — Déployer

1. Clique sur **"Deploy"** ou pousse un commit sur la branche principale
2. Railway va builder, exécuter les migrations Prisma, puis démarrer le serveur
3. Une fois déployé, note l'URL publique (ex. `https://carepilot-backend.up.railway.app`)

---

## 2. Déploiement du Frontend sur Vercel

### Étape 1 — Importer le projet

1. Va sur [vercel.com](https://vercel.com) et connecte-toi
2. Clique sur **"Add New Project"**
3. Importe le dépôt GitHub `carepilot-pro`

### Étape 2 — Configurer le build

Vercel utilise le fichier `vercel.json` à la racine. La configuration est déjà prête :

- **Build Command** : `cd frontend && npm install && npm run build`
- **Output Directory** : `frontend/dist`
- **Framework** : aucun (détection automatique désactivée)

Tu n'as rien à changer manuellement dans l'interface Vercel pour le build.

### Étape 3 — Ajouter les variables d'environnement

Dans Vercel → ton projet → onglet **"Settings"** → **"Environment Variables"**, ajoute :

| Variable | Valeur | Description |
|---|---|---|
| `VITE_API_URL` | `https://carepilot-backend.up.railway.app` | URL du backend Railway |
| `VITE_STRIPE_PUBLIC_KEY` | `pk_live_...` | Clé publique Stripe (côté frontend) |

> Remplace `carepilot-backend.up.railway.app` par l'URL réelle de ton déploiement Railway.

### Étape 4 — Déployer

Clique sur **"Deploy"**. Vercel va builder le frontend React et le mettre en ligne.
L'URL finale ressemblera à : `https://carepilot-pro.vercel.app`

---

## 3. Étapes post-déploiement

### Vérifier que le backend répond

Ouvre dans ton navigateur :

```
https://carepilot-backend.up.railway.app/health
```

Tu dois voir quelque chose comme :

```json
{ "status": "ok", "uptime": 42 }
```

### Insérer les données de test (seed)

Dans Railway, ouvre le **Shell** de ton service backend et exécute :

```bash
cd backend && node src/prisma/seed.js
```

Cela crée :
- L'entreprise "Ambulances du Dauphiné"
- Le compte `admin@carepilot.fr` / `password123`
- 3 véhicules et 2 salariés de test
- 5 missions de test

> **Important** : supprime ou change le mot de passe après les tests en production.

---

## 4. Configuration des webhooks Stripe

Les webhooks permettent à Stripe de notifier CarePilot Pro lors d'un paiement.

### Étape 1 — Créer le webhook dans Stripe

1. Va sur [dashboard.stripe.com](https://dashboard.stripe.com) → **Développeurs** → **Webhooks**
2. Clique sur **"Ajouter un endpoint"**
3. URL de l'endpoint :

```
https://carepilot-backend.up.railway.app/api/billing/webhook
```

4. Événements à écouter :
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`

### Étape 2 — Récupérer le secret webhook

Après création, Stripe affiche le **Signing secret** (`whsec_...`).
Ajoute-le dans Railway comme variable `STRIPE_WEBHOOK_SECRET`.

---

## 5. Configurer un domaine personnalisé

### Sur Vercel (frontend)

1. Vercel → ton projet → **Settings** → **Domains**
2. Clique sur **"Add"** et entre ton domaine (ex. `app.carepilot.fr`)
3. Suis les instructions pour ajouter un enregistrement CNAME chez ton hébergeur DNS

### Sur Railway (backend API)

1. Railway → ton service → **Settings** → **Networking** → **Custom Domain**
2. Entre ton sous-domaine API (ex. `api.carepilot.fr`)
3. Ajoute l'enregistrement CNAME indiqué chez ton hébergeur DNS

> Une fois le domaine API configuré, mets à jour `VITE_API_URL` dans Vercel avec la nouvelle URL et redéploie.

---

## Résumé des variables d'environnement

### Backend (Railway)

```
DATABASE_URL          = postgresql://... (auto Railway)
JWT_SECRET            = <chaine_aleatoire_32+_chars>
ANTHROPIC_API_KEY     = sk-ant-...
STRIPE_SECRET_KEY     = sk_live_...
STRIPE_WEBHOOK_SECRET = whsec_...
PORT                  = 3001
NODE_ENV              = production
```

### Frontend (Vercel)

```
VITE_API_URL              = https://ton-backend.up.railway.app
VITE_STRIPE_PUBLIC_KEY    = pk_live_...
```

---

## En cas de problème

| Symptôme | Solution |
|---|---|
| Le backend ne démarre pas | Vérifie les logs Railway, probablement une variable d'env manquante |
| Erreur Prisma au démarrage | La migration a échoué — vérifie que `DATABASE_URL` est correcte |
| Frontend affiche "Network Error" | `VITE_API_URL` pointe vers la mauvaise URL backend |
| Paiement Stripe ne fonctionne pas | Vérifie `STRIPE_WEBHOOK_SECRET` et que l'endpoint est bien enregistré |
| Page blanche sur Vercel | Vérifie les logs de build, probablement une erreur dans `VITE_API_URL` |
