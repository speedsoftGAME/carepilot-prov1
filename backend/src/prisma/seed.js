const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Nettoyage de la base...')

  await prisma.bonTransport.deleteMany()
  await prisma.alert.deleteMany()
  await prisma.imperatif.deleteMany()
  await prisma.planCell.deleteMany()
  await prisma.pointage.deleteMany()
  await prisma.mission.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.etablissement.deleteMany()
  await prisma.employee.deleteMany()
  await prisma.vehicle.deleteMany()
  await prisma.oKCareUsage.deleteMany()
  await prisma.apiKey.deleteMany()
  await prisma.samuConfig.deleteMany()
  await prisma.site.deleteMany()
  await prisma.user.deleteMany()
  await prisma.company.deleteMany()

  console.log('🏢 Création de l\'entreprise...')
  const company = await prisma.company.create({
    data: {
      name: 'Ambulances du Dauphiné',
      plan: 'pro',
      siret: '123 456 789 00015',
      phone: '04 76 65 12 34',
      email: 'contact@ambulances-dauphine.fr',
      address: '15 Rue des Alpes, 38500 Voiron',
    },
  })

  console.log('👤 Création de l\'administrateur...')
  const hashedPassword = await bcrypt.hash('password123', 10)
  await prisma.user.create({
    data: {
      email: 'admin@carepilot.fr',
      password: hashedPassword,
      name: 'Admin CarePilot',
      role: 'admin',
      companyId: company.id,
    },
  })

  console.log('🚑 Création des véhicules...')
  const [amb1, amb2, vsl1] = await Promise.all([
    prisma.vehicle.create({ data: { name: 'Ambulance 1', type: 'AMB', status: 'available', lat: 45.3658, lng: 5.5916, crew: 'Jean Dupont', companyId: company.id } }),
    prisma.vehicle.create({ data: { name: 'Ambulance 2', type: 'AMB', status: 'on_mission', lat: 45.1885, lng: 5.7245, companyId: company.id } }),
    prisma.vehicle.create({ data: { name: 'VSL 1', type: 'VSL', status: 'available', lat: 45.3650, lng: 5.5900, companyId: company.id } }),
  ])

  console.log('👷 Création des salariés...')
  const pin1 = await bcrypt.hash('1234', 10)
  const pin2 = await bcrypt.hash('5678', 10)
  await Promise.all([
    prisma.employee.create({ data: { name: 'Jean Dupont', role: 'Ambulancier DEA', pin: pin1, companyId: company.id } }),
    prisma.employee.create({ data: { name: 'Marie Martin', role: 'Auxiliaire ambulancier', pin: pin2, companyId: company.id } }),
  ])

  console.log('📋 Création des missions...')
  const today = new Date().toISOString().slice(0, 10)
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10)
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

  await Promise.all([
    prisma.mission.create({ data: { numero: 'M-2026-001', date: today, time: '08:00', patient: 'Robert Dubois', patNom: 'Dubois', patPrenom: 'Robert', nss: '1520469031234', mutuelle: 'MGEN', from: 'Voiron', to: 'CHU Grenoble', priority: 'urgent', type: 'AMB', status: 'in_progress', ca: 145.50, vehicleId: amb2.id, companyId: company.id } }),
    prisma.mission.create({ data: { numero: 'M-2026-002', date: today, time: '09:30', patient: 'Sophie Lefèvre', patNom: 'Lefèvre', patPrenom: 'Sophie', from: 'EHPAD Les Pins, Voiron', to: 'Clinique Belledonne, Échirolles', priority: 'normal', type: 'VSL', status: 'waiting', ca: 89.00, companyId: company.id } }),
    prisma.mission.create({ data: { numero: 'M-2026-003', date: today, time: '07:00', patient: 'Henri Moreau', patNom: 'Moreau', patPrenom: 'Henri', from: 'CHU Grenoble', to: '32 Rue des Pins, Voiron', priority: 'normal', type: 'AMB', status: 'done', ca: 145.50, vehicleId: amb1.id, companyId: company.id } }),
    prisma.mission.create({ data: { numero: 'M-2026-004', date: tomorrow, time: '06:30', patient: 'Gérard Fontaine', patNom: 'Fontaine', patPrenom: 'Gérard', from: 'Voiron', to: 'CHU Grenoble', priority: 'urgent', type: 'AMB', status: 'waiting', ca: 145.50, vehicleId: amb1.id, companyId: company.id } }),
    prisma.mission.create({ data: { numero: 'M-2026-005', date: tomorrow, time: '14:00', patient: 'Colette Renaud', patNom: 'Renaud', patPrenom: 'Colette', from: 'EHPAD Les Pins, Voiron', to: 'Clinique Belledonne, Échirolles', priority: 'normal', type: 'VSL', status: 'waiting', ca: 89.00, vehicleId: vsl1.id, companyId: company.id } }),
    prisma.mission.create({ data: { numero: 'M-2026-006', date: yesterday, time: '10:00', patient: 'Michel Garnier', patNom: 'Garnier', patPrenom: 'Michel', from: 'Domicile, Grenoble', to: 'CHU Grenoble', priority: 'normal', type: 'AMB', status: 'done', ca: 145.50, vehicleId: amb1.id, companyId: company.id } }),
  ])

  console.log('👤 Création des patients...')
  await Promise.all([
    prisma.patient.create({ data: { nom: 'Dubois', prenom: 'Robert', nss: '1520469031234', mutuelle: 'MGEN', ddn: '1952-04-15', tel: '06 12 34 56 78', adresse: '12 Rue des Alpes, Voiron', medecin: 'Dr. Favre', poids: 78, companyId: company.id } }),
    prisma.patient.create({ data: { nom: 'Lefèvre', prenom: 'Sophie', nss: '2781138044567', mutuelle: 'Harmonie Mutuelle', ddn: '1978-11-03', tel: '06 98 76 54 32', medecin: 'Dr. Blanc', companyId: company.id } }),
    prisma.patient.create({ data: { nom: 'Moreau', prenom: 'Henri', nss: '1450675089012', mutuelle: 'Malakoff Humanis', ddn: '1945-06-20', medecin: 'Dr. Arnaud', poids: 72.5, obs: 'Patient à mobilité réduite, prévoir fauteuil roulant', companyId: company.id } }),
  ])

  console.log('🏥 Création des établissements...')
  await Promise.all([
    prisma.etablissement.create({ data: { nom: 'CHU Grenoble', type: 'hopital', adresse: 'Avenue Maquis du Grésivaudan, 38700 La Tronche', tel: '04 76 76 75 75', service: 'Urgences / Cardiologie', companyId: company.id } }),
    prisma.etablissement.create({ data: { nom: 'Clinique Belledonne', type: 'clinique', adresse: '14 Rue de Comboire, 38130 Échirolles', tel: '04 76 33 00 33', service: 'Chirurgie ambulatoire', companyId: company.id } }),
    prisma.etablissement.create({ data: { nom: 'EHPAD Les Pins', type: 'ehpad', adresse: '32 Rue des Pins, 38500 Voiron', tel: '04 76 65 12 00', service: 'Résidence médicalisée', companyId: company.id } }),
    prisma.etablissement.create({ data: { nom: 'Cabinet Dr. Favre', type: 'cabinet', adresse: '8 Place de la Mairie, 38500 Voiron', tel: '04 76 65 44 11', companyId: company.id } }),
  ])

  console.log('🔔 Création des alertes...')
  await Promise.all([
    prisma.alert.create({ data: { type: 'warning', title: 'Ambulance 2 — Vidange huile recommandée', message: 'Kilométrage dépassé de 500 km. Intervention recommandée sous 5 jours.', companyId: company.id } }),
    prisma.alert.create({ data: { type: 'info', title: 'Système — Base de données initialisée', message: 'Les données de démonstration ont été chargées avec succès.', companyId: company.id } }),
    prisma.alert.create({ data: { type: 'error', title: 'GPS Ambulance 2 — Signal perdu', message: 'Aucune position reçue depuis 22 minutes.', companyId: company.id } }),
  ])

  console.log('⚡ Création des impératifs...')
  await Promise.all([
    prisma.imperatif.create({ data: { desc: 'Contrôle technique — Ambulance 1', remind: 5, companyId: company.id } }),
    prisma.imperatif.create({ data: { desc: 'Renouvellement assurance — VSL 1', remind: 12, companyId: company.id } }),
    prisma.imperatif.create({ data: { desc: 'Formation DEA — Jean Dupont', remind: 30, companyId: company.id } }),
    prisma.imperatif.create({ data: { desc: 'Nettoyage désinfection — Ambulance 2', remind: 2, companyId: company.id } }),
  ])

  console.log('\n✅ Seed terminé avec succès !')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📧 Email        : admin@carepilot.fr')
  console.log('🔑 Mot de passe : password123')
  console.log('🔢 PIN Jean     : 1234')
  console.log('🔢 PIN Marie    : 5678')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => { console.error('❌ Seed échoué:', e.message); process.exit(1) })
  .finally(() => prisma.$disconnect())
