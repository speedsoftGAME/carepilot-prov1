const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Nettoyage de la base de données...');
  await prisma.oKCareUsage.deleteMany();
  await prisma.imperatif.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.bonTransport.deleteMany();
  await prisma.planCell.deleteMany();
  await prisma.pointage.deleteMany();
  await prisma.mission.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.etablissement.deleteMany();
  await prisma.employee.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
  await prisma.company.deleteMany();

  console.log('Création de l\'entreprise...');
  const company = await prisma.company.create({
    data: {
      name: 'Ambulances du Dauphiné',
      siret: '12345678900010',
      address: '12 Rue de la République, 38500 Voiron',
      phone: '04 76 05 00 00',
      email: 'contact@ambulances-dauphine.fr',
      plan: 'pro',
    },
  });
  console.log(`✅ Entreprise créée : ${company.name}`);

  console.log('Création de l\'utilisateur admin...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.create({
    data: {
      email: 'admin@carepilot.fr',
      password: hashedPassword,
      name: 'Admin CarePilot',
      role: 'admin',
      companyId: company.id,
    },
  });
  console.log(`✅ Utilisateur créé : ${user.email}`);

  console.log('Création des véhicules...');
  const [amb1, amb2, vsl1] = await Promise.all([
    prisma.vehicle.create({
      data: {
        name: 'Ambulance 1',
        type: 'AMB',
        status: 'available',
        lat: 45.3627,
        lng: 5.5909,
        crew: 'Jean Dupont',
        companyId: company.id,
      },
    }),
    prisma.vehicle.create({
      data: {
        name: 'Ambulance 2',
        type: 'AMB',
        status: 'on_mission',
        lat: 45.1885,
        lng: 5.7245,
        crew: 'Marie Martin',
        companyId: company.id,
      },
    }),
    prisma.vehicle.create({
      data: {
        name: 'VSL 1',
        type: 'VSL',
        status: 'available',
        lat: 45.3627,
        lng: 5.5909,
        companyId: company.id,
      },
    }),
  ]);
  console.log('✅ 3 véhicules créés');

  console.log('Création des salariés (PINs hashés)...');
  const pin1 = await bcrypt.hash('1234', 10);
  const pin2 = await bcrypt.hash('5678', 10);
  await Promise.all([
    prisma.employee.create({
      data: {
        name: 'Jean Dupont',
        role: 'DEA',
        pin: pin1,
        companyId: company.id,
      },
    }),
    prisma.employee.create({
      data: {
        name: 'Marie Martin',
        role: 'DEA',
        pin: pin2,
        companyId: company.id,
      },
    }),
  ]);
  console.log('✅ 2 salariés créés (PINs hashés avec bcrypt)');

  console.log('Création des missions de test...');
  const today = new Date().toISOString().split('T')[0];
  await Promise.all([
    prisma.mission.create({
      data: {
        numero: 'M-2026-001',
        date: today,
        time: '08:00',
        patient: 'Dubois Robert',
        patNom: 'Dubois',
        patPrenom: 'Robert',
        from: 'Voiron - Domicile',
        to: 'CHU Grenoble - Urgences',
        priority: 'normal',
        type: 'AMB',
        trajet: 'aller',
        status: 'waiting',
        ca: 85.50,
        vehicleId: amb1.id,
        companyId: company.id,
      },
    }),
    prisma.mission.create({
      data: {
        numero: 'M-2026-002',
        date: today,
        time: '09:30',
        patient: 'Lefèvre Sophie',
        patNom: 'Lefèvre',
        patPrenom: 'Sophie',
        from: 'CHU Grenoble - Cardiologie',
        to: 'Voiron - EHPAD Les Pins',
        priority: 'urgent',
        type: 'AMB',
        trajet: 'retour',
        status: 'in_progress',
        ca: 92.00,
        vehicleId: amb2.id,
        companyId: company.id,
      },
    }),
    prisma.mission.create({
      data: {
        numero: 'M-2026-003',
        date: today,
        time: '11:00',
        patient: 'Bernard Michel',
        patNom: 'Bernard',
        patPrenom: 'Michel',
        from: 'Grenoble - Clinique Belledonne',
        to: 'Grenoble - CHU Rhumatologie',
        priority: 'normal',
        type: 'VSL',
        trajet: 'aller',
        status: 'done',
        ca: 45.00,
        vehicleId: vsl1.id,
        companyId: company.id,
      },
    }),
    prisma.mission.create({
      data: {
        numero: 'M-2026-004',
        date: today,
        time: '14:00',
        patient: 'Moreau Claire',
        patNom: 'Moreau',
        patPrenom: 'Claire',
        from: 'Voiron - Cabinet Dr. Petit',
        to: 'Grenoble - CHU Oncologie',
        priority: 'normal',
        type: 'VSL',
        trajet: 'aller',
        status: 'waiting',
        ca: 67.80,
        companyId: company.id,
      },
    }),
    prisma.mission.create({
      data: {
        numero: 'M-2026-005',
        date: today,
        time: '16:00',
        patient: 'Garcia Luis',
        patNom: 'Garcia',
        patPrenom: 'Luis',
        from: 'Grenoble - Domicile',
        to: 'Voiron - Clinique du Docteur Gaud',
        priority: 'urgent',
        type: 'AMB',
        trajet: 'aller',
        status: 'waiting',
        notes: 'Patient sous oxygène — prévoir matériel',
        ca: 120.00,
        companyId: company.id,
      },
    }),
  ]);
  console.log('✅ 5 missions de test créées');

  console.log('Création des établissements de référence...');
  await Promise.all([
    prisma.etablissement.create({
      data: {
        nom: 'CHU Grenoble',
        type: 'hopital',
        adresse: 'Avenue Maquis du Grésivaudan, 38700 La Tronche',
        tel: '04 76 76 75 75',
        companyId: company.id,
      },
    }),
    prisma.etablissement.create({
      data: {
        nom: 'Clinique Belledonne',
        type: 'clinique',
        adresse: '6 Rue Léon Blum, 38130 Échirolles',
        tel: '04 76 33 00 33',
        companyId: company.id,
      },
    }),
    prisma.etablissement.create({
      data: {
        nom: 'EHPAD Les Pins',
        type: 'ehpad',
        adresse: '15 Avenue des Alpes, 38500 Voiron',
        tel: '04 76 05 12 34',
        companyId: company.id,
      },
    }),
  ]);
  console.log('✅ 3 établissements créés');

  console.log('');
  console.log('============================================');
  console.log('✅ Base de données peuplée avec succès !');
  console.log('============================================');
  console.log('');
  console.log('Connexion : admin@carepilot.fr / password123');
  console.log('Entreprise : Ambulances du Dauphiné (plan pro)');
  console.log('Véhicules : Ambulance 1, Ambulance 2, VSL 1');
  console.log('Salariés  : Jean Dupont (PIN:1234), Marie Martin (PIN:5678)');
  console.log('Missions  : 5 missions de test');
}

main()
  .catch((e) => {
    console.error('Erreur lors du seed :', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
