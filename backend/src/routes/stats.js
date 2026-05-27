const express = require('express')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

// GET /api/stats/overview?month=YYYY-MM
router.get('/overview', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7)
    const today = new Date().toISOString().split('T')[0]

    const missions = await prisma.mission.findMany({
      where: { companyId: req.user.companyId, date: { startsWith: month } },
      select: {
        id: true, date: true, ca: true, status: true, type: true, vehicleId: true,
        vehicle: { select: { id: true, name: true } },
      },
    })

    const totalCA = missions.reduce((s, m) => s + (m.ca || 0), 0)
    const todayCA = missions.filter(m => m.date === today).reduce((s, m) => s + (m.ca || 0), 0)
    const doneCount = missions.filter(m => m.status === 'done').length

    // CA et compteur par jour
    const byDayMap = {}
    for (const m of missions) {
      if (!byDayMap[m.date]) byDayMap[m.date] = { date: m.date, ca: 0, count: 0 }
      byDayMap[m.date].ca += m.ca || 0
      byDayMap[m.date].count++
    }

    // CA par véhicule
    const byVehicleMap = {}
    for (const m of missions) {
      const vid = m.vehicleId || '__unassigned'
      if (!byVehicleMap[vid]) byVehicleMap[vid] = { vehicleId: vid, name: m.vehicle?.name || 'Non assigné', ca: 0, count: 0 }
      byVehicleMap[vid].ca += m.ca || 0
      byVehicleMap[vid].count++
    }

    // CA par type
    const byTypeMap = {}
    for (const m of missions) {
      if (!byTypeMap[m.type]) byTypeMap[m.type] = { type: m.type, ca: 0, count: 0 }
      byTypeMap[m.type].ca += m.ca || 0
      byTypeMap[m.type].count++
    }

    res.json({
      month,
      totalCA:      Math.round(totalCA * 100) / 100,
      todayCA:      Math.round(todayCA * 100) / 100,
      missionCount: missions.length,
      doneCount,
      byDay:     Object.values(byDayMap).sort((a, b) => a.date.localeCompare(b.date)),
      byVehicle: Object.values(byVehicleMap).sort((a, b) => b.ca - a.ca),
      byType:    Object.values(byTypeMap).sort((a, b) => b.ca - a.ca),
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur interne' })
  }
})

module.exports = router
