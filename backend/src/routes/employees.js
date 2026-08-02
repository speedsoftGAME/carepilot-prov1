const express = require('express')
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

const PLAN_LIMITS = { starter: 5, pro: 999, enterprise: 999 }

// GET /api/employees
router.get('/', async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, role: true, companyId: true, createdAt: true },
    })
    res.json(employees)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur interne' })
  }
})

// POST /api/employees — créer un salarié (PIN hashé)
router.post('/', async (req, res) => {
  try {
    const { name, role, pin } = req.body
    if (!name || !pin) return res.status(400).json({ error: 'Nom et PIN requis' })
    if (!/^\d{4,6}$/.test(pin)) return res.status(400).json({ error: 'Le PIN doit contenir 4 à 6 chiffres' })

    const company = await prisma.company.findUnique({ where: { id: req.user.companyId } })
    const count = await prisma.employee.count({ where: { companyId: req.user.companyId } })
    const limit = PLAN_LIMITS[company.plan] ?? 5
    if (count >= limit) {
      return res.status(403).json({ error: `Limite atteinte : plan "${company.plan}" → ${limit} salarié(s) max` })
    }

    const hashedPin = await bcrypt.hash(pin, 10)
    const employee = await prisma.employee.create({
      data: { name, role: role || null, pin: hashedPin, companyId: req.user.companyId },
      select: { id: true, name: true, role: true, companyId: true, createdAt: true },
    })
    res.status(201).json(employee)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur interne' })
  }
})

// PUT /api/employees/:id — modifier (nouveau PIN optionnel)
router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.employee.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } })
    if (!existing) return res.status(404).json({ error: 'Salarié introuvable' })

    const { name, role, pin } = req.body
    const data = { name: name ?? existing.name, role: role !== undefined ? role : existing.role }

    if (pin) {
      if (!/^\d{4,6}$/.test(pin)) return res.status(400).json({ error: 'PIN invalide' })
      data.pin = await bcrypt.hash(pin, 10)
    }

    const employee = await prisma.employee.update({
      where: { id: req.params.id },
      data,
      select: { id: true, name: true, role: true, companyId: true, createdAt: true },
    })
    res.json(employee)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur interne' })
  }
})

// DELETE /api/employees/:id
router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.employee.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } })
    if (!existing) return res.status(404).json({ error: 'Salarié introuvable' })
    await prisma.employee.delete({ where: { id: req.params.id } })
    res.json({ message: 'Salarié supprimé' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur interne' })
  }
})

// POST /api/employees/pin-auth — authentification par PIN (pointeuse)
router.post('/pin-auth', async (req, res) => {
  try {
    const { pin, companyId } = req.body
    const cid = companyId || req.user.companyId
    if (!pin) return res.status(400).json({ error: 'PIN requis' })

    const employees = await prisma.employee.findMany({ where: { companyId: cid } })
    for (const emp of employees) {
      const match = await bcrypt.compare(pin, emp.pin)
      if (match) {
        return res.json({ id: emp.id, name: emp.name, role: emp.role })
      }
    }
    res.status(401).json({ error: 'PIN incorrect' })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur interne' })
  }
})

module.exports = router
