const express = require('express')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const etablissements = await prisma.etablissement.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { nom: 'asc' },
    })
    res.json(etablissements)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

router.post('/', async (req, res) => {
  try {
    const { nom, type = 'hopital', adresse, tel, service } = req.body
    if (!nom) return res.status(400).json({ error: 'Nom requis' })
    const etab = await prisma.etablissement.create({
      data: { nom, type, adresse: adresse || null, tel: tel || null, service: service || null, companyId: req.user.companyId },
    })
    res.status(201).json(etab)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.etablissement.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } })
    if (!existing) return res.status(404).json({ error: 'Établissement introuvable' })
    const { nom, type, adresse, tel, service } = req.body
    const etab = await prisma.etablissement.update({
      where: { id: req.params.id },
      data: { nom: nom ?? existing.nom, type: type ?? existing.type, adresse: adresse !== undefined ? adresse : existing.adresse, tel: tel !== undefined ? tel : existing.tel, service: service !== undefined ? service : existing.service },
    })
    res.json(etab)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.etablissement.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } })
    if (!existing) return res.status(404).json({ error: 'Établissement introuvable' })
    await prisma.etablissement.delete({ where: { id: req.params.id } })
    res.json({ message: 'Établissement supprimé' })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

module.exports = router
