const express = require('express')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

// GET /api/pointage?date=YYYY-MM-DD&employeeId=xxx
router.get('/', async (req, res) => {
  try {
    const { date, employeeId } = req.query
    const where = { companyId: req.user.companyId }
    if (date) where.date = date
    if (employeeId) where.employeeId = employeeId

    const pointages = await prisma.pointage.findMany({
      where,
      include: { employee: { select: { id: true, name: true, role: true } } },
      orderBy: [{ date: 'desc' }, { time: 'desc' }],
    })
    res.json(pointages)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur interne' })
  }
})

// POST /api/pointage — pointer (entrée ou sortie)
// Body: { employeeId, type: 'entree'|'sortie', date?, time? }
router.post('/', async (req, res) => {
  try {
    const { employeeId, type } = req.body
    if (!employeeId || !type) return res.status(400).json({ error: 'employeeId et type requis' })
    if (!['entree', 'sortie'].includes(type)) return res.status(400).json({ error: 'type doit être "entree" ou "sortie"' })

    const employee = await prisma.employee.findFirst({ where: { id: employeeId, companyId: req.user.companyId } })
    if (!employee) return res.status(404).json({ error: 'Salarié introuvable' })

    const now = new Date()
    const date = req.body.date || now.toISOString().split('T')[0]
    const time = req.body.time || now.toTimeString().slice(0, 5)

    const pointage = await prisma.pointage.create({
      data: { employeeId, date, time, type, companyId: req.user.companyId },
      include: { employee: { select: { id: true, name: true, role: true } } },
    })
    res.status(201).json(pointage)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur interne' })
  }
})

// GET /api/pointage/heures?month=2026-05 — heures travaillées par salarié
router.get('/heures', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7)

    const pointages = await prisma.pointage.findMany({
      where: { companyId: req.user.companyId, date: { startsWith: month } },
      include: { employee: { select: { id: true, name: true } } },
      orderBy: [{ date: 'asc' }, { time: 'asc' }],
    })

    // Regroupe par salarié et calcule les heures (entrée→sortie)
    const byEmployee = {}
    for (const p of pointages) {
      const eid = p.employeeId
      if (!byEmployee[eid]) byEmployee[eid] = { employee: p.employee, jours: {}, totalHeures: 0 }
      const day = p.date
      if (!byEmployee[eid].jours[day]) byEmployee[eid].jours[day] = []
      byEmployee[eid].jours[day].push(p)
    }

    const result = Object.values(byEmployee).map(({ employee, jours, totalHeures }) => {
      let heures = 0
      const details = []
      for (const [date, pts] of Object.entries(jours)) {
        const entrees = pts.filter(p => p.type === 'entree').map(p => p.time).sort()
        const sorties = pts.filter(p => p.type === 'sortie').map(p => p.time).sort()
        let dayHeures = 0
        const n = Math.min(entrees.length, sorties.length)
        for (let i = 0; i < n; i++) {
          const [eh, em] = entrees[i].split(':').map(Number)
          const [sh, sm] = sorties[i].split(':').map(Number)
          dayHeures += (sh * 60 + sm - (eh * 60 + em)) / 60
        }
        heures += dayHeures
        details.push({ date, entrees, sorties, heures: Math.round(dayHeures * 100) / 100 })
      }
      return { employee, totalHeures: Math.round(heures * 100) / 100, details, month }
    })

    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur interne' })
  }
})

module.exports = router
