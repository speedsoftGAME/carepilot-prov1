const express = require('express');
const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

router.use(authMiddleware);

const PLAN_LIMITS = {
  starter:    { okcare: 50 },
  pro:        { okcare: 500 },
  enterprise: { okcare: 9999 },
};

// Retourne la clé AAAA-MM du mois courant
function currentMonth() {
  return new Date().toISOString().slice(0, 7);
}

// Récupère ou crée l'entrée d'usage OKCare du mois pour cette entreprise
async function getOrCreateUsage(companyId, month) {
  return prisma.oKCareUsage.upsert({
    where: { companyId_month: { companyId, month } },
    create: { companyId, month, count: 0 },
    update: {},
  });
}

// Simulation OKCare quand la clé API n'est pas configurée (mode démo)
function mockOKCareResponse(nss, mutuelle) {
  const couvertures = [
    { regime: 'Régime général', taux: 70, complementaire: mutuelle || 'MGEN', tauxCompl: 30 },
    { regime: 'Régime agricole (MSA)', taux: 70, complementaire: mutuelle || 'Groupama', tauxCompl: 30 },
    { regime: 'Régime général — ALD', taux: 100, complementaire: null, tauxCompl: 0 },
    { regime: 'CMU-C', taux: 100, complementaire: 'CSS', tauxCompl: 0 },
  ];
  // Déterminisme basé sur le dernier chiffre du NSS pour avoir des résultats cohérents
  const idx = nss ? parseInt(nss.slice(-1)) % couvertures.length : 0;
  const couverture = couvertures[idx];

  return {
    statut: 'couvert',
    nss: nss || 'Non renseigné',
    regime: couverture.regime,
    tauxRemboursement: couverture.taux,
    complementaire: couverture.complementaire,
    tauxComplementaire: couverture.tauxCompl,
    droitsOuverts: true,
    dateVerification: new Date().toISOString(),
    simulation: true,
  };
}

// POST /api/okcare/verify — vérifie la couverture maladie d'un patient
// Body : { nss, mutuelle, numMutuelle, patientNom, patientPrenom, ddn }
router.post('/verify', async (req, res) => {
  try {
    const { nss, mutuelle, numMutuelle, patientNom, patientPrenom, ddn } = req.body;

    if (!nss && !mutuelle) {
      return res.status(400).json({ error: 'NSS ou numéro de mutuelle requis pour la vérification' });
    }

    // 1. Vérification des limites du plan
    const company = await prisma.company.findUnique({ where: { id: req.user.companyId } });
    const month = currentMonth();
    const usage = await getOrCreateUsage(req.user.companyId, month);
    const limit = PLAN_LIMITS[company.plan]?.okcare ?? 50;

    if (usage.count >= limit) {
      return res.status(429).json({
        error: `Quota mensuel OKCare atteint (${limit} vérifications). Passez au plan supérieur ou attendez le mois prochain.`,
        usage: { count: usage.count, limit, month },
      });
    }

    // 2. Appel à l'API OKCare (ou simulation si clé absente)
    let result;
    const hasOKCareKey = process.env.OKCARE_API_KEY && !process.env.OKCARE_API_KEY.startsWith('...');

    if (hasOKCareKey) {
      try {
        const response = await axios.post(
          'https://api.okcare.fr/v1/droits',
          { nss, mutuelle, numMutuelle, nom: patientNom, prenom: patientPrenom, ddn },
          {
            headers: {
              Authorization: `Bearer ${process.env.OKCARE_API_KEY}`,
              'Content-Type': 'application/json',
            },
            timeout: 8000,
          }
        );
        result = response.data;
      } catch (apiErr) {
        const status = apiErr.response?.status;
        if (status === 404) {
          return res.status(404).json({ error: 'Patient non trouvé dans le système OKCare' });
        }
        if (status === 401) {
          return res.status(500).json({ error: 'Clé API OKCare invalide — vérifiez votre configuration' });
        }
        throw apiErr;
      }
    } else {
      result = mockOKCareResponse(nss, mutuelle);
    }

    // 3. Incrémentation du compteur d'usage
    await prisma.oKCareUsage.update({
      where: { companyId_month: { companyId: req.user.companyId, month } },
      data: { count: { increment: 1 } },
    });

    // 4. Réponse avec infos d'usage restant
    res.json({
      ...result,
      usage: {
        count: usage.count + 1,
        limit,
        remaining: limit - usage.count - 1,
        month,
      },
    });
  } catch (err) {
    console.error('Erreur POST /okcare/verify:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// GET /api/okcare/usage — consulte le compteur d'usage du mois en cours
router.get('/usage', async (req, res) => {
  try {
    const company = await prisma.company.findUnique({ where: { id: req.user.companyId } });
    const month = currentMonth();
    const usage = await getOrCreateUsage(req.user.companyId, month);
    const limit = PLAN_LIMITS[company.plan]?.okcare ?? 50;

    // Historique des 6 derniers mois
    const history = await prisma.oKCareUsage.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { month: 'desc' },
      take: 6,
      select: { month: true, count: true },
    });

    res.json({
      current: { count: usage.count, limit, remaining: limit - usage.count, month },
      plan: company.plan,
      history,
    });
  } catch (err) {
    console.error('Erreur GET /okcare/usage:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

module.exports = router;
