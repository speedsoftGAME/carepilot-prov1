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

// GET /api/missions/export — export CSV des missions
router.get('/export', async (req, res) => {
  try {
    const { date, status, priority } = req.query
    const where = { companyId: req.user.companyId }
    if (date) where.date = date
    if (status) where.status = status
    if (priority) where.priority = priority
    const missions = await prisma.mission.findMany({
      where,
      include: { vehicle: { select: { name: true } } },
      orderBy: [{ date: 'desc' }, { time: 'asc' }],
    })
    const STATUS_FR = { waiting: 'En attente', in_progress: 'En cours', done: 'Terminée', cancelled: 'Annulée' }
    const PRIO_FR   = { normal: 'Normal', urgent: 'Urgent' }
    const header = ['Numéro', 'Date', 'Heure', 'Patient', 'De', 'Vers', 'Type', 'Trajet', 'Priorité', 'Statut', 'Véhicule', 'CA (€)', 'NSS', 'Mutuelle', 'Notes'].join(';')
    const rows = missions.map(m => [
      m.numero, m.date, m.time || '', m.patient, m.from, m.to, m.type, m.trajet,
      PRIO_FR[m.priority] || m.priority, STATUS_FR[m.status] || m.status,
      m.vehicle?.name || '', (m.ca || 0).toFixed(2), m.nss || '', m.mutuelle || '', m.notes || '',
    ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(';'))
    const csv = '﻿' + [header, ...rows].join('\r\n')
    const filename = `missions_${date || 'export'}_${Date.now()}.csv`
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.send(csv)
  } catch (err) {
    console.error('Erreur export CSV:', err)
    res.status(500).json({ error: 'Erreur interne' })
  }
})

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

    // Notification push si mission urgente
    if (priority === 'urgent') {
      const io = req.app.get('io');
      if (io) {
        io.to(`company:${req.user.companyId}`).emit('notification', {
          type: 'urgent',
          title: '🚨 Mission urgente',
          message: `${patient} — ${from} → ${to}`,
        });
      }
    }

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

      // Crée automatiquement un bon de transport quand la mission est terminée
      if (status === 'done' && existing.status !== 'done') {
        const year = new Date().getFullYear();
        const btCount = await tx.bonTransport.count({ where: { companyId: req.user.companyId } });
        const numero = `BT-${year}-${String(btCount + 1).padStart(3, '0')}`;
        await tx.bonTransport.create({
          data: {
            numero, missionId: existing.id,
            patient: existing.patient,
            nss: existing.nss || null, mutuelle: existing.mutuelle || null,
            numMutuelle: existing.numMutuelle || null, ddn: existing.ddn || null,
            date: existing.date, from: existing.from, to: existing.to,
            type: existing.type, trajet: existing.trajet,
            amount: existing.ca || 0, notes: existing.notes || null,
            status: 'pending', companyId: req.user.companyId,
          },
        });
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

    if (vehicleId) {
      const io = req.app.get('io');
      if (io) {
        io.to(`company:${req.user.companyId}`).emit('notification', {
          type: 'info',
          title: '🚑 Véhicule assigné',
          message: `${mission.vehicle?.name || vehicleId} → Mission ${existing.numero}`,
        });
      }
    }

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
