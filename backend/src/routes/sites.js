const express = require('express')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const sites = await prisma.site.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { name: 'asc' },
    })
    res.json(sites)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

router.post('/', async (req, res) => {
  try {
    const { name, address, phone } = req.body
    if (!name) return res.status(400).json({ error: 'Nom requis' })
    const site = await prisma.site.create({ data: { name, address: address || null, phone: phone || null, companyId: req.user.companyId } })
    res.status(201).json(site)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.site.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } })
    if (!existing) return res.status(404).json({ error: 'Site introuvable' })
    const { name, address, phone } = req.body
    const site = await prisma.site.update({ where: { id: req.params.id }, data: { name: name ?? existing.name, address: address !== undefined ? address : existing.address, phone: phone !== undefined ? phone : existing.phone } })
    res.json(site)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.site.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } })
    if (!existing) return res.status(404).json({ error: 'Site introuvable' })
    await prisma.site.delete({ where: { id: req.params.id } })
    res.json({ message: 'Site supprimé' })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

module.exports = router
