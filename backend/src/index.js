const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const missionsRoutes = require('./routes/missions');
const vehiclesRoutes = require('./routes/vehicles');
const dispatchRoutes = require('./routes/dispatch');
const okcareRoutes = require('./routes/okcare');
const billingRoutes = require('./routes/billing');

const app = express();
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

app.listen(PORT, () => {
  console.log(`CarePilot Pro API démarrée sur le port ${PORT}`);
});
