#!/bin/bash
# ============================================================
# CarePilot Pro — Script d'initialisation
# Lance ce script dans ton terminal après avoir installé Node.js
# Usage : bash setup.sh
# ============================================================

set -e  # Arrêter si erreur

echo ""
echo "🚑 CarePilot Pro — Initialisation du projet"
echo "============================================"
echo ""

# Vérifier Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js n'est pas installé."
  echo "   Télécharge-le sur : https://nodejs.org (version LTS)"
  exit 1
fi

NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
  echo "❌ Node.js version $NODE_VERSION détectée. Version 18+ requise."
  exit 1
fi
echo "✅ Node.js $(node --version) détecté"

# Vérifier Docker
if ! command -v docker &> /dev/null; then
  echo "⚠️  Docker non détecté — installe Docker Desktop pour PostgreSQL local"
  echo "   https://www.docker.com/products/docker-desktop"
else
  echo "✅ Docker $(docker --version | cut -d' ' -f3 | tr -d ',') détecté"
fi

echo ""
echo "📁 Création de la structure du projet..."
mkdir -p carepilot-pro/{frontend,backend/src/{routes,middleware,prisma}}
cd carepilot-pro

# ─── docker-compose.yml ────────────────────────────────────
cat > docker-compose.yml << 'EOF'
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: carepilot
      POSTGRES_PASSWORD: carepilot123
      POSTGRES_DB: carepilot_pro
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U carepilot"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
EOF
echo "✅ docker-compose.yml créé"

# ─── BACKEND package.json ──────────────────────────────────
cd backend
cat > package.json << 'EOF'
{
  "name": "carepilot-backend",
  "version": "1.0.0",
  "description": "CarePilot Pro — API Backend",
  "main": "src/index.js",
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "node src/prisma/seed.js"
  }
}
EOF

echo "📦 Installation des dépendances backend..."
npm install express prisma @prisma/client jsonwebtoken bcryptjs cors \
  dotenv @anthropic-ai/sdk axios socket.io stripe express-rate-limit \
  helmet morgan --silent

npm install -D nodemon --silent
echo "✅ Backend installé"

# .env.example
cat > .env.example << 'EOF'
DATABASE_URL="postgresql://carepilot:carepilot123@localhost:5432/carepilot_pro"
JWT_SECRET="changeme_super_secret_jwt_2026"
ANTHROPIC_API_KEY="sk-ant-..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
PORT=3001
EOF

cp .env.example .env
echo "✅ .env créé (à compléter avec tes vraies clés)"

# ─── FRONTEND ──────────────────────────────────────────────
cd ../frontend
echo "📦 Création du projet React..."
npm create vite@latest . -- --template react --silent 2>/dev/null || true
npm install --silent

echo "📦 Installation des dépendances frontend..."
npm install axios zustand react-router-dom leaflet react-leaflet \
  @tailwindcss/vite tailwindcss --silent

echo "✅ Frontend installé"

# tailwind.config.js
cat > tailwind.config.js << 'EOF'
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          dark: '#0A1628',
          DEFAULT: '#0D2347',
        },
        brand: {
          DEFAULT: '#1565C0',
          light: '#2196F3',
        }
      }
    }
  },
  plugins: []
}
EOF

# ─── RÉSUMÉ ────────────────────────────────────────────────
cd ..
echo ""
echo "============================================"
echo "✅ Projet initialisé avec succès !"
echo "============================================"
echo ""
echo "📋 Prochaines étapes :"
echo ""
echo "  1. Lance PostgreSQL :"
echo "     docker-compose up -d"
echo ""
echo "  2. Ouvre Claude Code dans ce dossier :"
echo "     cd carepilot-pro"
echo "     claude"
echo ""
echo "  3. Copie le message suivant dans Claude Code :"
echo ""
echo "┌─────────────────────────────────────────────────────┐"
echo "│ Lis le fichier CLAUDE.md en entier, puis démarre    │"
echo "│ la Phase 1 Étape 1 : initialise Prisma, crée le     │"
echo "│ schéma complet et fait la première migration.       │"
echo "│ Explique-moi chaque fichier que tu crées.           │"
echo "└─────────────────────────────────────────────────────┘"
echo ""
