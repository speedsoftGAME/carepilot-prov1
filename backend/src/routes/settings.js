const express = require('express')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

// GET /api/settings — paramètres généraux de l'entreprise
router.get('/', async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.user.companyId },
      select: { id: true, name: true, siret: true, address: true, phone: true, email: true, plan: true, primaryColor: true, logoUrl: true, appName: true },
    })
    const samuConfig = await prisma.samuConfig.findUnique({ where: { companyId: req.user.companyId } })
    res.json({ company, samuConfig })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

// PUT /api/settings/company — infos entreprise
router.put('/company', async (req, res) => {
  try {
    const { name, siret, address, phone, email } = req.body
    const company = await prisma.company.update({
      where: { id: req.user.companyId },
      data: { name, siret, address, phone, email },
      select: { id: true, name: true, siret: true, address: true, phone: true, email: true, plan: true, primaryColor: true, logoUrl: true, appName: true },
    })
    res.json(company)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

// PUT /api/settings/branding — personnalisation visuelle
router.put('/branding', async (req, res) => {
  try {
    const { primaryColor, logoUrl, appName } = req.body
    const company = await prisma.company.update({
      where: { id: req.user.companyId },
      data: {
        primaryColor: primaryColor || null,
        logoUrl: logoUrl || null,
        appName: appName || null,
      },
      select: { id: true, name: true, plan: true, primaryColor: true, logoUrl: true, appName: true },
    })
    res.json(company)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

// PUT /api/settings/samu — configuration SAMU
router.put('/samu', async (req, res) => {
  try {
    const { endpointUrl, token, enabled } = req.body
    const samuConfig = await prisma.samuConfig.upsert({
      where: { companyId: req.user.companyId },
      create: { companyId: req.user.companyId, endpointUrl: endpointUrl || null, token: token || null, enabled: enabled ?? false },
      update: { endpointUrl: endpointUrl || null, token: token !== undefined ? token : undefined, enabled: enabled ?? false },
    })
    res.json(samuConfig)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

module.exports = router
