const express = require('express')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

// GET /api/planning?week=2026-W22 — planning de la semaine
router.get('/', async (req, res) => {
  try {
    const { weekStart, weekEnd } = getWeekRange(req.query.week)

    const cells = await prisma.planCell.findMany({
      where: {
        companyId: req.user.companyId,
        date: { gte: weekStart, lte: weekEnd },
      },
      include: { employee: { select: { id: true, name: true, role: true } } },
      orderBy: [{ date: 'asc' }],
    })
    res.json({ cells, weekStart, weekEnd })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur interne' })
  }
})

// PUT /api/planning — créer ou modifier une cellule (upsert)
// Body: { employeeId, date, hours, type }
router.put('/', async (req, res) => {
  try {
    const { employeeId, date, hours, type = 'work' } = req.body
    if (!employeeId || !date) return res.status(400).json({ error: 'employeeId et date requis' })

    const employee = await prisma.employee.findFirst({ where: { id: employeeId, companyId: req.user.companyId } })
    if (!employee) return res.status(404).json({ error: 'Salarié introuvable' })

    const VALID_TYPES = ['work', 'morning', 'afternoon', 'night', 'rest', 'vacation', 'sick']
    if (!VALID_TYPES.includes(type)) return res.status(400).json({ error: 'Type de quart invalide' })

    const cell = await prisma.planCell.upsert({
      where: { employeeId_date: { employeeId, date } },
      create: { employeeId, date, hours: hours || 0, type, companyId: req.user.companyId },
      update: { hours: hours || 0, type },
      include: { employee: { select: { id: true, name: true } } },
    })
    res.json(cell)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur interne' })
  }
})

// DELETE /api/planning/:employeeId/:date
router.delete('/:employeeId/:date', async (req, res) => {
  try {
    const { employeeId, date } = req.params
    const cell = await prisma.planCell.findFirst({
      where: { employeeId, date, companyId: req.user.companyId },
    })
    if (!cell) return res.status(404).json({ error: 'Cellule introuvable' })

    await prisma.planCell.delete({ where: { employeeId_date: { employeeId, date } } })
    res.json({ message: 'Supprimé' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur interne' })
  }
})

// GET /api/planning/export-csv?month=2026-05 — export CSV paie
router.get('/export-csv', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7)
    const { weekStart } = getWeekRange()

    const cells = await prisma.planCell.findMany({
      where: { companyId: req.user.companyId, date: { startsWith: month } },
      include: { employee: { select: { id: true, name: true, role: true } } },
      orderBy: [{ employee: { name: 'asc' } }, { date: 'asc' }],
    })

    // Regroupe par salarié
    const byEmployee = {}
    for (const c of cells) {
      const eid = c.employeeId
      if (!byEmployee[eid]) byEmployee[eid] = { name: c.employee.name, role: c.employee.role, totalHours: 0, workDays: 0, restDays: 0, vacationDays: 0 }
      byEmployee[eid].totalHours += c.hours
      if (c.type === 'rest') byEmployee[eid].restDays++
      else if (c.type === 'vacation') byEmployee[eid].vacationDays++
      else byEmployee[eid].workDays++
    }

    const rows = [
      'Nom,Rôle,Heures travaillées,Jours travaillés,Jours repos,Jours congés,Mois',
      ...Object.values(byEmployee).map(e =>
        `"${e.name}","${e.role || ''}",${e.totalHours.toFixed(1)},${e.workDays},${e.restDays},${e.vacationDays},"${month}"`
      ),
    ]

    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="planning-${month}.csv"`)
    res.send('﻿' + rows.join('\n'))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur interne' })
  }
})

function getWeekRange(weekStr) {
  let monday
  if (weekStr) {
    const [year, week] = weekStr.split('-W').map(Number)
    const jan4 = new Date(year, 0, 4)
    const startOfWeek1 = new Date(jan4)
    startOfWeek1.setDate(jan4.getDate() - ((jan4.getDay() + 6) % 7))
    monday = new Date(startOfWeek1)
    monday.setDate(startOfWeek1.getDate() + (week - 1) * 7)
  } else {
    monday = new Date()
    const day = monday.getDay()
    monday.setDate(monday.getDate() - ((day + 6) % 7))
  }
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return {
    weekStart: monday.toISOString().split('T')[0],
    weekEnd: sunday.toISOString().split('T')[0],
  }
}

module.exports = router
