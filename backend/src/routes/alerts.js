const express = require('express')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const alerts = await prisma.alert.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    res.json(alerts)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

router.post('/', async (req, res) => {
  try {
    const { type = 'info', title, message } = req.body
    if (!title) return res.status(400).json({ error: 'Titre requis' })
    if (!['info', 'warning', 'error'].includes(type)) return res.status(400).json({ error: 'Type invalide' })
    const alert = await prisma.alert.create({ data: { type, title, message: message || null, companyId: req.user.companyId } })
    const io = req.app.get('io')
    if (io) io.to(`company:${req.user.companyId}`).emit('notification', { type, title, message })
    res.status(201).json(alert)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

router.patch('/:id/read', async (req, res) => {
  try {
    const existing = await prisma.alert.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } })
    if (!existing) return res.status(404).json({ error: 'Alerte introuvable' })
    const alert = await prisma.alert.update({ where: { id: req.params.id }, data: { read: true } })
    res.json(alert)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

router.post('/read-all', async (req, res) => {
  try {
    await prisma.alert.updateMany({ where: { companyId: req.user.companyId, read: false }, data: { read: true } })
    res.json({ message: 'Toutes les alertes marquées lues' })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.alert.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } })
    if (!existing) return res.status(404).json({ error: 'Alerte introuvable' })
    await prisma.alert.delete({ where: { id: req.params.id } })
    res.json({ message: 'Alerte supprimée' })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

module.exports = router
