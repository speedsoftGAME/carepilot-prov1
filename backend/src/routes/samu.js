const express = require('express')
const { PrismaClient } = require('@prisma/client')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

// POST /api/samu/webhook — reçoit une alerte SAMU (format simplifié)
// Authentifié par header X-SAMU-Token (configuré dans SamuConfig)
router.post('/webhook', async (req, res) => {
  try {
    const token = req.headers['x-samu-token']
    if (!token) return res.status(401).json({ error: 'X-SAMU-Token requis' })

    const config = await prisma.samuConfig.findFirst({ where: { token, enabled: true } })
    if (!config) return res.status(401).json({ error: 'Token SAMU invalide ou intégration désactivée' })

    const { numeroDossier, patient, adresseDepart, adresseArrivee, typeTransport = 'AMB', priorite = 'urgent', commentaire } = req.body
    if (!patient || !adresseDepart || !adresseArrivee) {
      return res.status(400).json({ error: 'patient, adresseDepart, adresseArrivee requis' })
    }

    const year = new Date().getFullYear()
    const date = new Date().toISOString().split('T')[0]
    const time = new Date().toTimeString().slice(0, 5)
    const count = await prisma.mission.count({ where: { companyId: config.companyId } })
    const numero = numeroDossier || `SAMU-${year}-${String(count + 1).padStart(3, '0')}`

    const mission = await prisma.mission.create({
      data: {
        numero, patient, date, time,
        from: adresseDepart, to: adresseArrivee,
        type: typeTransport, priority: priorite,
        notes: commentaire || null,
        companyId: config.companyId,
      },
    })

    // Notification temps réel si Socket.io disponible
    const io = req.app.get('io')
    if (io) {
      io.to(`company:${config.companyId}`).emit('notification', {
        type: 'urgent',
        title: '🚨 Alerte SAMU',
        message: `${patient} — ${adresseDepart} → ${adresseArrivee}`,
      })
    }

    res.status(201).json({ mission, message: 'Mission créée depuis alerte SAMU' })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

// Routes protégées par JWT
router.use(authMiddleware)

// GET /api/samu/config
router.get('/config', async (req, res) => {
  try {
    const config = await prisma.samuConfig.findUnique({ where: { companyId: req.user.companyId } })
    // Masque le token dans la réponse
    if (config?.token) config.token = config.token.slice(0, 4) + '••••••••'
    res.json(config || { enabled: false })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

module.exports = router
