const express = require('express')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    const { search } = req.query
    const where = { companyId: req.user.companyId }
    if (search) {
      where.OR = [
        { nom: { contains: search, mode: 'insensitive' } },
        { prenom: { contains: search, mode: 'insensitive' } },
        { nss: { contains: search } },
      ]
    }
    const patients = await prisma.patient.findMany({ where, orderBy: { nom: 'asc' } })
    res.json(patients)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

router.get('/:id', async (req, res) => {
  try {
    const patient = await prisma.patient.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } })
    if (!patient) return res.status(404).json({ error: 'Patient introuvable' })
    res.json(patient)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

router.post('/', async (req, res) => {
  try {
    const { nom, prenom, nss, mutuelle, ddn, tel, adresse, medecin, obs, poids } = req.body
    if (!nom) return res.status(400).json({ error: 'Nom requis' })
    const patient = await prisma.patient.create({
      data: { nom, prenom: prenom || null, nss: nss || null, mutuelle: mutuelle || null, ddn: ddn || null, tel: tel || null, adresse: adresse || null, medecin: medecin || null, obs: obs || null, poids: poids ? parseFloat(poids) : null, companyId: req.user.companyId },
    })
    res.status(201).json(patient)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

router.put('/:id', async (req, res) => {
  try {
    const existing = await prisma.patient.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } })
    if (!existing) return res.status(404).json({ error: 'Patient introuvable' })
    const { nom, prenom, nss, mutuelle, ddn, tel, adresse, medecin, obs, poids } = req.body
    const patient = await prisma.patient.update({
      where: { id: req.params.id },
      data: { nom: nom ?? existing.nom, prenom: prenom !== undefined ? prenom : existing.prenom, nss: nss !== undefined ? nss : existing.nss, mutuelle: mutuelle !== undefined ? mutuelle : existing.mutuelle, ddn: ddn !== undefined ? ddn : existing.ddn, tel: tel !== undefined ? tel : existing.tel, adresse: adresse !== undefined ? adresse : existing.adresse, medecin: medecin !== undefined ? medecin : existing.medecin, obs: obs !== undefined ? obs : existing.obs, poids: poids !== undefined ? (poids ? parseFloat(poids) : null) : existing.poids },
    })
    res.json(patient)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

router.delete('/:id', async (req, res) => {
  try {
    const existing = await prisma.patient.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } })
    if (!existing) return res.status(404).json({ error: 'Patient introuvable' })
    await prisma.patient.delete({ where: { id: req.params.id } })
    res.json({ message: 'Patient supprimé' })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

module.exports = router
