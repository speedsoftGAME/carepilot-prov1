const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const PLAN_HIERARCHY = { starter: 0, pro: 1, enterprise: 2 };

// Vérifie que le plan de l'entreprise est >= au plan requis
// Utilisation : router.get('/feature', planCheck('pro'), handler)
function planCheck(requiredPlan) {
  return async (req, res, next) => {
    try {
      const company = await prisma.company.findUnique({
        where: { id: req.user.companyId },
        select: { plan: true },
      });

      const current = PLAN_HIERARCHY[company?.plan] ?? 0;
      const required = PLAN_HIERARCHY[requiredPlan] ?? 0;

      if (current < required) {
        return res.status(403).json({
          error: `Cette fonctionnalité nécessite le plan "${requiredPlan}" ou supérieur. Votre plan actuel : "${company?.plan}".`,
          requiredPlan,
          currentPlan: company?.plan,
          upgradeUrl: '/api/billing/checkout',
        });
      }

      next();
    } catch (err) {
      console.error('Erreur planCheck:', err);
      res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  };
}

module.exports = planCheck;
