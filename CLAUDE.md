# CarePilot Pro — Instructions Claude Code

## Contexte
SaaS B2B de régulation ambulancière pour le marché français.
Migration d'un HTML monolithique (220KB) vers React + Node.js + PostgreSQL.
Éditeur : Dylan (non-développeur). Toujours expliquer ce que tu fais.

## Stack
```
Frontend  : React 18 + Vite + TailwindCSS + React Router
Backend   : Node.js + Express
BDD       : PostgreSQL + Prisma ORM
Auth      : JWT + bcrypt
Maps      : Leaflet.js + OpenStreetMap + Nominatim
IA        : Anthropic API claude-sonnet-4-5 (BACKEND UNIQUEMENT)
Paiement  : Stripe
Temps réel: Socket.io (GPS véhicules)
Deploy    : Railway (backend + BDD) + Vercel (frontend)
```

## Structure des fichiers
```
carepilot-pro/
├── CLAUDE.md
├── docker-compose.yml
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       ├── components/
│       │   ├── layout/
│       │   │   ├── Header.jsx
│       │   │   ├── StatsBar.jsx
│       │   │   └── TabBar.jsx
│       │   ├── missions/
│       │   │   ├── MissionsList.jsx
│       │   │   ├── MissionCard.jsx
│       │   │   ├── MissionModal.jsx
│       │   │   └── VehiclePicker.jsx
│       │   ├── dispatch/
│       │   │   └── DispatchIA.jsx
│       │   ├── okcare/
│       │   │   └── OKCareModal.jsx
│       │   ├── settings/
│       │   │   └── SettingsModal.jsx
│       │   └── shared/
│       │       ├── Toast.jsx
│       │       ├── EmptyState.jsx
│       │       └── Modal.jsx
│       ├── pages/
│       │   ├── Login.jsx
│       │   ├── Dashboard.jsx
│       │   └── panels/
│       │       ├── MissionsPanel.jsx
│       │       ├── FlottePanel.jsx
│       │       ├── GPSPanel.jsx
│       │       ├── CartePanel.jsx
│       │       ├── ElisaPanel.jsx
│       │       ├── PointeusePanel.jsx
│       │       ├── PatientsPanel.jsx
│       │       ├── EtablissementsPanel.jsx
│       │       ├── FacturationPanel.jsx
│       │       ├── CAPanel.jsx
│       │       ├── HeuresPanel.jsx
│       │       ├── PlanningPanel.jsx
│       │       ├── J1Panel.jsx
│       │       ├── ImperatifsPanel.jsx
│       │       └── AlertesPanel.jsx
│       ├── hooks/
│       │   ├── useAuth.js
│       │   ├── useMissions.js
│       │   ├── useVehicles.js
│       │   └── useSocket.js
│       ├── api/
│       │   ├── client.js
│       │   ├── auth.js
│       │   ├── missions.js
│       │   ├── vehicles.js
│       │   ├── employees.js
│       │   ├── okcare.js
│       │   └── dispatch.js
│       └── store/
│           └── useStore.js
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── missions.js
│       │   ├── vehicles.js
│       │   ├── employees.js
│       │   ├── patients.js
│       │   ├── planning.js
│       │   ├── pointage.js
│       │   ├── okcare.js
│       │   ├── dispatch.js
│       │   └── billing.js
│       ├── middleware/
│       │   ├── auth.js
│       │   ├── rateLimit.js
│       │   └── tenant.js
│       └── prisma/
│           └── schema.prisma
└── carepilot_pro.html  ← référence visuelle, NE PAS MODIFIER
```

## Schéma Prisma complet
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Company {
  id           String    @id @default(cuid())
  name         String
  siret        String?
  address      String?
  phone        String?
  email        String?
  plan         String    @default("starter")
  stripeId     String?
  createdAt    DateTime  @default(now())
  users        User[]
  vehicles     Vehicle[]
  employees    Employee[]
  missions     Mission[]
  patients     Patient[]
  etablissements Etablissement[]
  alerts       Alert[]
  imperatifs   Imperatif[]
  okcareUsage  OKCareUsage[]
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  password  String
  name      String?
  role      String   @default("dispatcher")
  companyId String
  company   Company  @relation(fields: [companyId], references: [id])
  createdAt DateTime @default(now())
}

model Vehicle {
  id        String    @id @default(cuid())
  name      String
  type      String    @default("AMB")
  status    String    @default("available")
  lat       Float?
  lng       Float?
  crew      String?
  companyId String
  company   Company   @relation(fields: [companyId], references: [id])
  missions  Mission[]
  createdAt DateTime  @default(now())
}

model Employee {
  id        String     @id @default(cuid())
  name      String
  role      String?
  pin       String
  companyId String
  company   Company    @relation(fields: [companyId], references: [id])
  pointages Pointage[]
  planCells PlanCell[]
  createdAt DateTime   @default(now())
}

model Mission {
  id          String   @id @default(cuid())
  numero      String
  date        String
  time        String?
  patient     String
  patNom      String?
  patPrenom   String?
  nss         String?
  mutuelle    String?
  numMutuelle String?
  ddn         String?
  phone       String?
  adresse     String?
  medecin     String?
  obs         String?
  from        String
  to          String
  priority    String   @default("normal")
  type        String   @default("AMB")
  trajet      String   @default("aller")
  status      String   @default("waiting")
  notes       String?
  ca          Float    @default(0)
  vehicleId   String?
  vehicle     Vehicle? @relation(fields: [vehicleId], references: [id])
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id])
  createdAt   DateTime @default(now())
}

model Patient {
  id        String   @id @default(cuid())
  nom       String
  prenom    String?
  nss       String?
  mutuelle  String?
  ddn       String?
  tel       String?
  adresse   String?
  medecin   String?
  obs       String?
  poids     Float?
  companyId String
  company   Company  @relation(fields: [companyId], references: [id])
  createdAt DateTime @default(now())
}

model Etablissement {
  id        String   @id @default(cuid())
  nom       String
  type      String   @default("hopital")
  adresse   String?
  tel       String?
  service   String?
  companyId String
  company   Company  @relation(fields: [companyId], references: [id])
  createdAt DateTime @default(now())
}

model Pointage {
  id         String   @id @default(cuid())
  employeeId String
  employee   Employee @relation(fields: [employeeId], references: [id])
  date       String
  time       String
  type       String
  companyId  String
  createdAt  DateTime @default(now())
}

model PlanCell {
  id         String   @id @default(cuid())
  employeeId String
  employee   Employee @relation(fields: [employeeId], references: [id])
  date       String
  hours      Float    @default(0)
  type       String   @default("work")
  companyId  String
  createdAt  DateTime @default(now())
  @@unique([employeeId, date])
}

model BonTransport {
  id        String   @id @default(cuid())
  numero    String
  missionId String?
  patient   String
  date      String
  from      String?
  to        String?
  amount    Float    @default(0)
  status    String   @default("pending")
  companyId String
  company   Company  @relation(fields: [companyId], references: [id])
  createdAt DateTime @default(now())
}

model Alert {
  id        String   @id @default(cuid())
  type      String   @default("info")
  title     String
  message   String?
  read      Boolean  @default(false)
  companyId String
  company   Company  @relation(fields: [companyId], references: [id])
  createdAt DateTime @default(now())
}

model Imperatif {
  id        String   @id @default(cuid())
  desc      String
  remind    Int      @default(30)
  companyId String
  company   Company  @relation(fields: [companyId], references: [id])
  createdAt DateTime @default(now())
}

model OKCareUsage {
  id        String   @id @default(cuid())
  companyId String
  company   Company  @relation(fields: [companyId], references: [id])
  month     String
  count     Int      @default(0)
  @@unique([companyId, month])
}
```

## Limites par plan
```js
const PLAN_LIMITS = {
  starter:    { okcare: 50,   vehicles: 3,   employees: 5  },
  pro:        { okcare: 500,  vehicles: 999, employees: 999 },
  enterprise: { okcare: 9999, vehicles: 999, employees: 999 }
}
```

## Variables d'environnement
```bash
# backend/.env
DATABASE_URL="postgresql://carepilot:carepilot123@localhost:5432/carepilot_pro"
JWT_SECRET="changeme_super_secret_jwt_key_2026"
ANTHROPIC_API_KEY="sk-ant-..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PORT=3001

# frontend/.env
VITE_API_URL="http://localhost:3001"
VITE_STRIPE_PUBLIC_KEY="pk_test_..."
```

## Design System (couleurs exactes du HTML)
```css
--navy-dark:   #0A1628;   /* Header background */
--navy:        #0D2347;   /* Gradient */
--blue:        #1565C0;   /* Boutons principaux */
--blue-light:  #2196F3;   /* Accent */
--green:       #00C853;   /* Disponible / succès */
--orange:      #FF6D00;   /* En mission */
--red:         #F44336;   /* Urgence */
--bg-app:      #F0F4FF;   /* Fond général */
--border:      #E2E8F0;
--text-main:   #1F2937;
--text-sub:    #64748B;
--text-muted:  #94A3B8;
```

## Ordre de développement — 4 phases

### PHASE 1 — MVP vendable (semaines 1-4)
```
Étape 1 : Setup monorepo + Docker PostgreSQL + Prisma migrate
Étape 2 : Auth (register, login, JWT middleware, refresh token)
Étape 3 : Missions CRUD (create, read, update, delete, assign vehicle)
Étape 4 : Véhicules CRUD + statuts
Étape 5 : Dispatch IA (geocoding Nominatim + Haversine + Claude backend)
Étape 6 : OKCare proxy (backend sécurisé + compteur usage + limites plan)
Étape 7 : Stripe (3 plans, abonnement, webhook, accès conditionnel)
Étape 8 : Dashboard React complet avec les 15 panels
```

### PHASE 2 — Rétention (semaines 5-8)
```
Étape 9  : BT automatique à la fin d'une mission + PDF Cerfa
Étape 10 : GPS réel via PWA ambulancier + Socket.io
Étape 11 : Notifications push (mission urgente, véhicule assigné)
Étape 12 : Planning RH (congés, heures, export CSV paie)
```

### PHASE 3 — Avantage concurrentiel (mois 3-4)
```
Étape 13 : App mobile ambulancier (PWA installable)
Étape 14 : Signature électronique patient sur tablette
Étape 15 : Statistiques avancées (occupation flotte, CA/véhicule)
Étape 16 : Export comptabilité (Sage, EBP)
```

### PHASE 4 — Scale (mois 5+)
```
Étape 17 : Multi-sites (une entreprise, plusieurs agences)
Étape 18 : API publique (clients Enterprise)
Étape 19 : White-label
Étape 20 : Intégration SAMU réelle
```

## Règles absolues
- **JAMAIS** appeler Anthropic depuis le frontend → toujours via backend/routes/okcare.js
- **TOUJOURS** filtrer par companyId dans chaque requête SQL
- **PINs salariés** hashés avec bcrypt (jamais en clair)
- **NSS** : chiffrement recommandé (colonne encrypted dans Prisma)
- Commits Git avant chaque étape : `git commit -m "feat: étape X terminée"`
- Tous les labels en français
- Expliquer chaque fichier créé à Dylan

## Terminologie métier française
- mission = transport ambulancier
- régulation = dispatch / coordination
- BT / BTI = bon de transport
- SMUR = Service Mobile d'Urgence et de Réanimation  
- VSL = Véhicule Sanitaire Léger
- AMB = Ambulance
- DEA = Diplôme d'État d'Ambulancier
- SAMU = Service d'Aide Médicale Urgente
- Élisa = interface de communication SAMU ↔ ambulancier

## Commandes utiles
```bash
# Démarrer l'environnement
docker-compose up -d              # PostgreSQL
cd backend && npm run dev         # API sur port 3001
cd frontend && npm run dev        # React sur port 5173

# Prisma
npx prisma migrate dev --name init    # Créer les tables
npx prisma studio                     # Interface visuelle BDD
npx prisma db seed                    # Données de test

# Git
git add . && git commit -m "feat: description"
```

## Données de test (seed)
Créer dans backend/src/prisma/seed.js :
- 1 entreprise : "Ambulances du Dauphiné", plan "pro"
- 1 user : admin@carepilot.fr / password123
- 3 véhicules : Ambulance 1 (AMB), Ambulance 2 (AMB), VSL 1
- 2 salariés : Jean Dupont (PIN: 1234), Marie Martin (PIN: 5678)
- 5 missions de test variées (normal, urgent, terminée)
- Zone géographique : Voiron/Grenoble (45.18°N, 5.72°E)
