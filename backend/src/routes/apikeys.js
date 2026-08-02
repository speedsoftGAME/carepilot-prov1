const express = require('express')
const crypto = require('crypto')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const keys = await prisma.apiKey.findMany({
      where: { companyId: req.user.companyId },
      select: { id: true, name: true, key: true, lastUsed: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    })
    // Masque la clé sauf les 8 premiers caractères
    const masked = keys.map(k => ({ ...k, key: k.key.slice(0, 8) + '••••••••••••••••••••••••' }))
    res.json(masked)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

router.post('/', async (req, res) => {
  try {
    const { name } = req.body
    if (!name) return res.status(400).json({ error: 'Nom requis' })
    const key = 'cp_' + crypto.randomBytes(24).toString('hex')
    const apiKey = await prisma.apiKey.create({ data: { key, name, companyId: req.user.companyId } })
    // Retourne la clé complète UNE SEULE FOIS à la création
    res.status(201).json(apiKey)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.apiKey.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } })
    if (!existing) return res.status(404).json({ error: 'Clé introuvable' })
    await prisma.apiKey.delete({ where: { id: req.params.id } })
    res.json({ message: 'Clé révoquée' })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

module.exports = router
