const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

const PLAN_LIMITS = {
  starter:    { vehicles: 3 },
  pro:        { vehicles: 999 },
  enterprise: { vehicles: 999 },
};

// GET /api/vehicles — liste des véhicules de l'entreprise
// Query params : status, type
router.get('/', async (req, res) => {
  try {
    const { status, type } = req.query;
    const where = { companyId: req.user.companyId };
    if (status) where.status = status;
    if (type) where.type = type;

    const vehicles = await prisma.vehicle.findMany({
      where,
      include: {
        missions: {
          where: { status: { in: ['waiting', 'in_progress'] } },
          select: { id: true, numero: true, patient: true, status: true, date: true, time: true },
          orderBy: { date: 'asc' },
        },
      },
      orderBy: { name: 'asc' },
    });

    res.json(vehicles);
  } catch (err) {
    console.error('Erreur GET /vehicles:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// GET /api/vehicles/:id — détail d'un véhicule
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
      include: {
        missions: {
          orderBy: { date: 'desc' },
          take: 20,
          select: { id: true, numero: true, patient: true, status: true, date: true, time: true, from: true, to: true },
        },
      },
    });

    if (!vehicle) return res.status(404).json({ error: 'Véhicule introuvable' });
    res.json(vehicle);
  } catch (err) {
    console.error('Erreur GET /vehicles/:id:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// POST /api/vehicles — créer un véhicule (limité par le plan)
router.post('/', async (req, res) => {
  try {
    const { name, type = 'AMB', crew } = req.body;

    if (!name) return res.status(400).json({ error: 'Le nom du véhicule est requis' });

    const VALID_TYPES = ['AMB', 'VSL', 'SMUR', 'TAXI'];
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ error: `Type invalide. Valeurs acceptées : ${VALID_TYPES.join(', ')}` });
    }

    // Vérification de la limite du plan
    const company = await prisma.company.findUnique({ where: { id: req.user.companyId } });
    const currentCount = await prisma.vehicle.count({ where: { companyId: req.user.companyId } });
    const limit = PLAN_LIMITS[company.plan]?.vehicles ?? 3;

    if (currentCount >= limit) {
      return res.status(403).json({
        error: `Limite atteinte : votre plan "${company.plan}" autorise ${limit} véhicule(s) maximum`,
      });
    }

    const vehicle = await prisma.vehicle.create({
      data: { name, type, crew: crew || null, companyId: req.user.companyId },
    });

    res.status(201).json(vehicle);
  } catch (err) {
    console.error('Erreur POST /vehicles:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// PUT /api/vehicles/:id — modifier un véhicule
router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.vehicle.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
    });
    if (!existing) return res.status(404).json({ error: 'Véhicule introuvable' });

    const { name, type, crew } = req.body;

    if (type) {
      const VALID_TYPES = ['AMB', 'VSL', 'SMUR', 'TAXI'];
      if (!VALID_TYPES.includes(type)) {
        return res.status(400).json({ error: `Type invalide. Valeurs acceptées : ${VALID_TYPES.join(', ')}` });
      }
    }

    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data: {
        name: name ?? existing.name,
        type: type ?? existing.type,
        crew: crew !== undefined ? (crew || null) : existing.crew,
      },
    });

    res.json(vehicle);
  } catch (err) {
    console.error('Erreur PUT /vehicles/:id:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// PATCH /api/vehicles/:id/status — changer le statut manuellement
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const VALID = ['available', 'on_mission', 'maintenance', 'unavailable'];
    if (!VALID.includes(status)) {
      return res.status(400).json({ error: `Statut invalide. Valeurs acceptées : ${VALID.join(', ')}` });
    }

    const existing = await prisma.vehicle.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
    });
    if (!existing) return res.status(404).json({ error: 'Véhicule introuvable' });

    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(vehicle);
  } catch (err) {
    console.error('Erreur PATCH /vehicles/:id/status:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// PATCH /api/vehicles/:id/position — mise à jour GPS (utilisé par Socket.io à l'étape 10)
router.patch('/:id/position', async (req, res) => {
  try {
    const { lat, lng } = req.body;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'lat et lng sont requis' });
    }

    const existing = await prisma.vehicle.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
    });
    if (!existing) return res.status(404).json({ error: 'Véhicule introuvable' });

    const vehicle = await prisma.vehicle.update({
      where: { id: req.params.id },
      data: { lat: parseFloat(lat), lng: parseFloat(lng) },
    });

    res.json(vehicle);
  } catch (err) {
    console.error('Erreur PATCH /vehicles/:id/position:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// DELETE /api/vehicles/:id — supprimer un véhicule (interdit si missions actives)
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.vehicle.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
    });
    if (!existing) return res.status(404).json({ error: 'Véhicule introuvable' });

    const activeMissions = await prisma.mission.count({
      where: { vehicleId: req.params.id, status: { in: ['waiting', 'in_progress'] } },
    });

    if (activeMissions > 0) {
      return res.status(409).json({
        error: `Impossible de supprimer : ${activeMissions} mission(s) active(s) assignée(s) à ce véhicule`,
      });
    }

    await prisma.vehicle.delete({ where: { id: req.params.id } });
    res.json({ message: 'Véhicule supprimé' });
  } catch (err) {
    console.error('Erreur DELETE /vehicles/:id:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

module.exports = router;
