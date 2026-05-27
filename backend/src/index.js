const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const missionsRoutes = require('./routes/missions');
const vehiclesRoutes = require('./routes/vehicles');
const dispatchRoutes = require('./routes/dispatch');
const okcareRoutes = require('./routes/okcare');
const billingRoutes = require('./routes/billing');
const employeesRoutes = require('./routes/employees');
const pointageRoutes = require('./routes/pointage');
const planningRoutes = require('./routes/planning');
const statsRoutes = require('./routes/stats');

const app = express();
const httpServer = createServer(app);
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:5173' }));
app.use(morgan('dev'));

// Le webhook Stripe doit recevoir le corps brut (avant express.json)
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', version: '1.0.0', service: 'CarePilot Pro API' });
});

app.use('/api/auth', authRoutes);
app.use('/api/missions', missionsRoutes);
app.use('/api/vehicles', vehiclesRoutes);
app.use('/api/dispatch', dispatchRoutes);
app.use('/api/okcare', okcareRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/pointage', pointageRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/stats', statsRoutes);

// ─── Socket.io — GPS temps réel ─────────────────────────────────────────────
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  // Dashboard : rejoindre la salle de l'entreprise
  socket.on('join', ({ companyId, token }) => {
    if (!companyId) return;
    socket.join(`company:${companyId}`);
    socket.data.companyId = companyId;
  });

  // Ambulancier : envoie sa position GPS
  socket.on('vehicle:position', async ({ vehicleId, lat, lng, companyId }) => {
    if (!vehicleId || lat == null || lng == null || !companyId) return;
    try {
      await prisma.vehicle.updateMany({
        where: { id: vehicleId, companyId },
        data: { lat: parseFloat(lat), lng: parseFloat(lng) },
      });
      io.to(`company:${companyId}`).emit('vehicle:position', { vehicleId, lat, lng });
    } catch (e) {
      console.error('Erreur GPS update:', e.message);
    }
  });

  // Utilitaire : diffuser une notification à toute l'entreprise
  socket.on('notify', ({ companyId, type, title, message }) => {
    if (!companyId) return;
    io.to(`company:${companyId}`).emit('notification', { type, title, message });
  });
});

// Expose io pour les routes qui veulent envoyer des notifications
app.set('io', io);

httpServer.listen(PORT, () => {
  console.log(`CarePilot Pro API démarrée sur le port ${PORT} (Socket.io activé)`);
});
