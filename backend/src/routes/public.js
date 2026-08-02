const express = require('express')
const { PrismaClient } = require('@prisma/client')
const apiKeyAuth = require('../middleware/apiKeyAuth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(apiKeyAuth)

// GET /api/public/status — infos générales de l'entreprise
router.get('/status', async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.companyId },
      select: { name: true, plan: true },
    })
    const vehicles = await prisma.vehicle.findMany({ where: { companyId: req.companyId }, select: { id: true, name: true, type: true, status: true } })
    res.json({ company, vehicles, timestamp: new Date().toISOString() })
  } catch (err) { res.status(500).json({ error: 'Erreur interne' }) }
})

// GET /api/public/missions?date=YYYY-MM-DD&status=waiting
router.get('/missions', async (req, res) => {
  try {
    const where = { companyId: req.companyId }
    if (req.query.date) where.date = req.query.date
    if (req.query.status) where.status = req.query.status
    const missions = await prisma.mission.findMany({
      where, orderBy: [{ date: 'desc' }, { time: 'asc' }],
      select: { id: true, numero: true, date: true, time: true, patient: true, from: true, to: true, type: true, status: true, priority: true },
    })
    res.json({ missions, count: missions.length })
  } catch (err) { res.status(500).json({ error: 'Erreur interne' }) }
})

// GET /api/public/vehicles
router.get('/vehicles', async (req, res) => {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: { companyId: req.companyId },
      select: { id: true, name: true, type: true, status: true, lat: true, lng: true },
    })
    res.json({ vehicles })
  } catch (err) { res.status(500).json({ error: 'Erreur interne' }) }
})

// POST /api/public/missions — créer une mission via API (SAMU, partenaires)
router.post('/missions', async (req, res) => {
  try {
    const { patient, date, time, from, to, type = 'AMB', priority = 'normal', notes } = req.body
    if (!patient || !date || !from || !to) return res.status(400).json({ error: 'patient, date, from, to requis' })

    const year = new Date().getFullYear()
    const count = await prisma.mission.count({ where: { companyId: req.companyId } })
    const numero = `M-${year}-${String(count + 1).padStart(3, '0')}`

    const mission = await prisma.mission.create({
      data: { numero, patient, date, time: time || null, from, to, type, priority, notes: notes || null, companyId: req.companyId },
    })

    // Notification Socket.io si l'app tourne
    res.status(201).json(mission)
  } catch (err) { res.status(500).json({ error: 'Erreur interne' }) }
})

module.exports = router
