const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = async function apiKeyAuth(req, res, next) {
  const key = req.headers['x-api-key']
  if (!key) return res.status(401).json({ error: 'Clé API requise — header X-API-Key manquant' })

  const apiKey = await prisma.apiKey.findUnique({ where: { key } })
  if (!apiKey) return res.status(401).json({ error: 'Clé API invalide ou révoquée' })

  await prisma.apiKey.update({ where: { id: apiKey.id }, data: { lastUsed: new Date() } }).catch(() => {})
  req.companyId = apiKey.companyId
  next()
}
