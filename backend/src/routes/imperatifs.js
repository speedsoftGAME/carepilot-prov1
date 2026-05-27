const express = require('express')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const imperatifs = await prisma.imperatif.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { remind: 'asc' },
    })
    res.json(imperatifs)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

router.post('/', async (req, res) => {
  try {
    const { desc, remind = 30 } = req.body
    if (!desc) return res.status(400).json({ error: 'Description requise' })
    const imp = await prisma.imperatif.create({ data: { desc, remind: parseInt(remind) || 30, companyId: req.user.companyId } })
    res.status(201).json(imp)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.imperatif.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } })
    if (!existing) return res.status(404).json({ error: 'Impératif introuvable' })
    const { desc, remind } = req.body
    const imp = await prisma.imperatif.update({
      where: { id: req.params.id },
      data: { desc: desc ?? existing.desc, remind: remind !== undefined ? parseInt(remind) : existing.remind },
    })
    res.json(imp)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.imperatif.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } })
    if (!existing) return res.status(404).json({ error: 'Impératif introuvable' })
    await prisma.imperatif.delete({ where: { id: req.params.id } })
    res.json({ message: 'Impératif supprimé' })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

module.exports = router
