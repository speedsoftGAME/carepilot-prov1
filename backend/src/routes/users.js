const express = require('express')
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const authMiddleware = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

router.use(authMiddleware)

// GET /api/users — liste des utilisateurs de l'entreprise
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { companyId: req.user.companyId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    })
    res.json(users)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

// POST /api/users — créer un utilisateur (admin seulement)
router.post('/', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès réservé aux administrateurs' })
  try {
    const { email, name, role = 'dispatcher', password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' })
    if (password.length < 8) return res.status(400).json({ error: 'Mot de passe trop court (8 caractères min)' })
    if (!['admin', 'dispatcher'].includes(role)) return res.status(400).json({ error: 'Rôle invalide' })
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'Cet email est déjà utilisé' })
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { email, name: name || email.split('@')[0], role, password: hashedPassword, companyId: req.user.companyId },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    })
    res.status(201).json(user)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

// PUT /api/users/:id/role — changer le rôle (admin seulement)
router.put('/:id/role', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès réservé aux administrateurs' })
  try {
    const { role } = req.body
    if (!['admin', 'dispatcher'].includes(role)) return res.status(400).json({ error: 'Rôle invalide' })
    const existing = await prisma.user.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } })
    if (!existing) return res.status(404).json({ error: 'Utilisateur introuvable' })
    if (existing.id === req.user.id) return res.status(400).json({ error: 'Vous ne pouvez pas modifier votre propre rôle' })
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { role }, select: { id: true, email: true, name: true, role: true, createdAt: true } })
    res.json(user)
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

// DELETE /api/users/:id — supprimer (admin seulement, pas soi-même)
router.delete('/:id', async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Accès réservé aux administrateurs' })
  if (req.params.id === req.user.id) return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' })
  try {
    const existing = await prisma.user.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } })
    if (!existing) return res.status(404).json({ error: 'Utilisateur introuvable' })
    await prisma.user.delete({ where: { id: req.params.id } })
    res.json({ message: 'Utilisateur supprimé' })
  } catch (err) { console.error(err); res.status(500).json({ error: 'Erreur interne' }) }
})

module.exports = router
