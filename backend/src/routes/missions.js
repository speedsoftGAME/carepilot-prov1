const express = require('express');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

// Génère un numéro de mission unique : M-2026-042
async function genNumero(companyId) {
  const year = new Date().getFullYear();
  const count = await prisma.mission.count({ where: { companyId } });
  return `M-${year}-${String(count + 1).padStart(3, '0')}`;
}

// GET /api/missions — liste des missions de l'entreprise
// Query params optionnels : date, status, priority, vehicleId
router.get('/', async (req, res) => {
  try {
    const { date, status, priority, vehicleId } = req.query;

    const where = { companyId: req.user.companyId };
    if (date) where.date = date;
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (vehicleId) where.vehicleId = vehicleId;

    const missions = await prisma.mission.findMany({
      where,
      include: { vehicle: { select: { id: true, name: true, type: true, status: true } } },
      orderBy: [{ date: 'desc' }, { time: 'asc' }],
    });

    res.json(missions);
  } catch (err) {
    console.error('Erreur GET /missions:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// GET /api/missions/:id — détail d'une mission
router.get('/:id', async (req, res) => {
  try {
    const mission = await prisma.mission.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
      include: { vehicle: true },
    });

    if (!mission) return res.status(404).json({ error: 'Mission introuvable' });
    res.json(mission);
  } catch (err) {
    console.error('Erreur GET /missions/:id:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// POST /api/missions — créer une mission
router.post('/', async (req, res) => {
  try {
    const {
      date, time, patient, patNom, patPrenom, nss, mutuelle, numMutuelle,
      ddn, phone, adresse, medecin, obs, from, to,
      priority = 'normal', type = 'AMB', trajet = 'aller',
      notes, ca = 0, vehicleId,
    } = req.body;

    if (!date || !patient || !from || !to) {
      return res.status(400).json({ error: 'Champs requis : date, patient, from, to' });
    }

    const numero = await genNumero(req.user.companyId);

    if (vehicleId) {
      const vehicle = await prisma.vehicle.findFirst({
        where: { id: vehicleId, companyId: req.user.companyId },
      });
      if (!vehicle) return res.status(400).json({ error: 'Véhicule introuvable' });
    }

    const mission = await prisma.mission.create({
      data: {
        numero, date, time, patient, patNom, patPrenom, nss, mutuelle, numMutuelle,
        ddn, phone, adresse, medecin, obs, from, to,
        priority, type, trajet, notes, ca,
        vehicleId: vehicleId || null,
        companyId: req.user.companyId,
      },
      include: { vehicle: { select: { id: true, name: true, type: true, status: true } } },
    });

    res.status(201).json(mission);
  } catch (err) {
    console.error('Erreur POST /missions:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// PUT /api/missions/:id — modifier une mission complète
router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.mission.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
    });
    if (!existing) return res.status(404).json({ error: 'Mission introuvable' });

    const {
      date, time, patient, patNom, patPrenom, nss, mutuelle, numMutuelle,
      ddn, phone, adresse, medecin, obs, from, to,
      priority, type, trajet, status, notes, ca, vehicleId,
    } = req.body;

    if (vehicleId && vehicleId !== existing.vehicleId) {
      const vehicle = await prisma.vehicle.findFirst({
        where: { id: vehicleId, companyId: req.user.companyId },
      });
      if (!vehicle) return res.status(400).json({ error: 'Véhicule introuvable' });
    }

    const mission = await prisma.mission.update({
      where: { id: req.params.id },
      data: {
        date, time, patient, patNom, patPrenom, nss, mutuelle, numMutuelle,
        ddn, phone, adresse, medecin, obs, from, to,
        priority, type, trajet, status, notes,
        ca: ca !== undefined ? parseFloat(ca) : undefined,
        vehicleId: vehicleId !== undefined ? (vehicleId || null) : undefined,
      },
      include: { vehicle: { select: { id: true, name: true, type: true, status: true } } },
    });

    res.json(mission);
  } catch (err) {
    console.error('Erreur PUT /missions/:id:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// PATCH /api/missions/:id/status — changer le statut d'une mission
// Statuts valides : waiting → in_progress → done | cancelled
router.patch('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const VALID = ['waiting', 'in_progress', 'done', 'cancelled'];
    if (!VALID.includes(status)) {
      return res.status(400).json({ error: `Statut invalide. Valeurs acceptées : ${VALID.join(', ')}` });
    }

    const existing = await prisma.mission.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
    });
    if (!existing) return res.status(404).json({ error: 'Mission introuvable' });

    const mission = await prisma.$transaction(async (tx) => {
      const updated = await tx.mission.update({
        where: { id: req.params.id },
        data: { status },
        include: { vehicle: { select: { id: true, name: true, type: true, status: true } } },
      });

      // Met à jour le statut du véhicule en cohérence avec la mission
      if (existing.vehicleId) {
        if (status === 'in_progress') {
          await tx.vehicle.update({ where: { id: existing.vehicleId }, data: { status: 'on_mission' } });
        } else if (status === 'done' || status === 'cancelled') {
          await tx.vehicle.update({ where: { id: existing.vehicleId }, data: { status: 'available' } });
        }
      }

      return updated;
    });

    res.json(mission);
  } catch (err) {
    console.error('Erreur PATCH /missions/:id/status:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// PATCH /api/missions/:id/vehicle — assigner ou désassigner un véhicule
router.patch('/:id/vehicle', async (req, res) => {
  try {
    const { vehicleId } = req.body;

    const existing = await prisma.mission.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
    });
    if (!existing) return res.status(404).json({ error: 'Mission introuvable' });

    if (vehicleId) {
      const vehicle = await prisma.vehicle.findFirst({
        where: { id: vehicleId, companyId: req.user.companyId },
      });
      if (!vehicle) return res.status(400).json({ error: 'Véhicule introuvable' });
    }

    const mission = await prisma.mission.update({
      where: { id: req.params.id },
      data: { vehicleId: vehicleId || null },
      include: { vehicle: { select: { id: true, name: true, type: true, status: true } } },
    });

    res.json(mission);
  } catch (err) {
    console.error('Erreur PATCH /missions/:id/vehicle:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// DELETE /api/missions/:id — supprimer une mission
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.mission.findFirst({
      where: { id: req.params.id, companyId: req.user.companyId },
    });
    if (!existing) return res.status(404).json({ error: 'Mission introuvable' });

    await prisma.mission.delete({ where: { id: req.params.id } });
    res.json({ message: 'Mission supprimée' });
  } catch (err) {
    console.error('Erreur DELETE /missions/:id:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

module.exports = router;
