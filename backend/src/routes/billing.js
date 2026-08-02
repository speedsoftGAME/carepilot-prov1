const express = require('express');
const Stripe = require('stripe');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Stripe n'est initialisé que si la clé est configurée
const stripeEnabled = process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_test_...');
const stripe = stripeEnabled ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

// Définition des plans (prix configurés via variables d'environnement)
const PLANS = {
  starter: {
    name: 'Starter',
    price: 0,
    currency: 'eur',
    interval: null,
    stripePriceId: null,
    features: ['3 véhicules', '5 salariés', '50 vérifications OKCare/mois', 'Dispatch IA de base'],
  },
  pro: {
    name: 'Pro',
    price: 149,
    currency: 'eur',
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRICE_PRO_MONTHLY || null,
    features: ['Véhicules illimités', 'Salariés illimités', '500 vérifications OKCare/mois', 'Dispatch IA avancé', 'GPS temps réel', 'BT automatiques'],
  },
  enterprise: {
    name: 'Enterprise',
    price: 399,
    currency: 'eur',
    interval: 'month',
    stripePriceId: process.env.STRIPE_PRICE_ENTERPRISE_MONTHLY || null,
    features: ['Tout Pro', '9 999 vérifications OKCare/mois', 'Multi-sites', 'API publique', 'Support prioritaire', 'SLA garanti'],
  },
};

// GET /api/billing/plans — liste les plans disponibles (public, pas d'auth requise)
router.get('/plans', (req, res) => {
  res.json({
    plans: PLANS,
    stripeEnabled,
  });
});

// POST /api/billing/webhook — reçoit les événements Stripe (pas d'auth JWT, Stripe signe lui-même)
// IMPORTANT : utilise express.raw() monté dans index.js avant express.json()
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  if (!stripeEnabled) {
    return res.json({ received: true, demo: true });
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Signature webhook invalide:', err.message);
    return res.status(400).json({ error: `Webhook invalide : ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const companyId = session.metadata?.companyId;
        const plan = session.metadata?.plan;
        if (companyId && plan) {
          await prisma.company.update({
            where: { id: companyId },
            data: { plan, stripeId: session.customer },
          });
          console.log(`Plan mis à jour : entreprise ${companyId} → ${plan}`);
        }
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const companyId = sub.metadata?.companyId;
        const plan = sub.metadata?.plan;
        if (companyId && plan && sub.status === 'active') {
          await prisma.company.update({ where: { id: companyId }, data: { plan } });
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const companyId = sub.metadata?.companyId;
        if (companyId) {
          await prisma.company.update({ where: { id: companyId }, data: { plan: 'starter' } });
          console.log(`Abonnement annulé : entreprise ${companyId} → starter`);
        }
        break;
      }
      case 'invoice.payment_failed': {
        console.warn(`Paiement échoué pour le customer : ${event.data.object.customer}`);
        break;
      }
      default:
        break;
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Erreur traitement webhook:', err);
    res.status(500).json({ error: 'Erreur traitement webhook' });
  }
});

// Routes protégées ci-dessous
router.use(authMiddleware);

// GET /api/billing/status — statut d'abonnement de l'entreprise
router.get('/status', async (req, res) => {
  try {
    const company = await prisma.company.findUnique({
      where: { id: req.user.companyId },
      select: { id: true, name: true, plan: true, stripeId: true },
    });

    let subscription = null;
    if (stripeEnabled && company.stripeId) {
      try {
        const subs = await stripe.subscriptions.list({
          customer: company.stripeId,
          status: 'active',
          limit: 1,
        });
        if (subs.data.length > 0) {
          const s = subs.data[0];
          subscription = {
            id: s.id,
            status: s.status,
            currentPeriodEnd: new Date(s.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: s.cancel_at_period_end,
          };
        }
      } catch (e) {
        console.warn('Impossible de récupérer l\'abonnement Stripe:', e.message);
      }
    }

    res.json({
      plan: company.plan,
      planDetails: PLANS[company.plan],
      subscription,
      stripeEnabled,
    });
  } catch (err) {
    console.error('Erreur GET /billing/status:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// POST /api/billing/checkout — crée une session Stripe Checkout
// Body : { plan: 'pro' | 'enterprise', successUrl, cancelUrl }
router.post('/checkout', async (req, res) => {
  try {
    const { plan, successUrl, cancelUrl } = req.body;

    if (!['pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({ error: 'Plan invalide. Valeurs acceptées : pro, enterprise' });
    }

    if (!stripeEnabled) {
      return res.status(503).json({
        error: 'Stripe non configuré. Ajoutez STRIPE_SECRET_KEY dans votre .env.',
        demo: true,
        simulatedPlan: plan,
        message: `En production, cette route redirige vers Stripe pour passer au plan "${plan}".`,
      });
    }

    const planData = PLANS[plan];
    if (!planData.stripePriceId) {
      return res.status(503).json({
        error: `Prix Stripe non configuré pour le plan "${plan}". Ajoutez STRIPE_PRICE_${plan.toUpperCase()}_MONTHLY dans votre .env.`,
      });
    }

    const company = await prisma.company.findUnique({ where: { id: req.user.companyId } });
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    // Crée ou récupère le customer Stripe
    let customerId = company.stripeId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: company.name,
        metadata: { companyId: company.id },
      });
      customerId = customer.id;
      await prisma.company.update({
        where: { id: company.id },
        data: { stripeId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: planData.stripePriceId, quantity: 1 }],
      success_url: successUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?upgrade=success`,
      cancel_url: cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?upgrade=cancelled`,
      metadata: { companyId: company.id, plan },
      subscription_data: { metadata: { companyId: company.id, plan } },
    });

    res.json({ checkoutUrl: session.url, sessionId: session.id });
  } catch (err) {
    console.error('Erreur POST /billing/checkout:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// ─── Bons de Transport ──────────────────────────────────────────────────────

// GET /api/billing/bt?month=YYYY-MM
router.get('/bt', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7)
    const bts = await prisma.bonTransport.findMany({
      where: { companyId: req.user.companyId, date: { startsWith: month } },
      orderBy: { createdAt: 'desc' },
    })
    res.json(bts)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur interne' })
  }
})

// POST /api/billing/bt
router.post('/bt', async (req, res) => {
  try {
    const { patient, date, from, to, amount, type, trajet, nss, mutuelle, numMutuelle, ddn, missionId, notes } = req.body
    if (!patient || !date) return res.status(400).json({ error: 'patient et date requis' })

    const year = new Date().getFullYear()
    const count = await prisma.bonTransport.count({ where: { companyId: req.user.companyId } })
    const numero = `BT-${year}-${String(count + 1).padStart(3, '0')}`

    const bt = await prisma.bonTransport.create({
      data: {
        numero, patient, date,
        from: from || null, to: to || null,
        amount: parseFloat(amount) || 0,
        type: type || null, trajet: trajet || null,
        nss: nss || null, mutuelle: mutuelle || null, numMutuelle: numMutuelle || null, ddn: ddn || null,
        missionId: missionId || null, notes: notes || null,
        status: 'pending', companyId: req.user.companyId,
      },
    })
    res.status(201).json(bt)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur interne' })
  }
})

// PATCH /api/billing/bt/:id/status
router.patch('/bt/:id/status', async (req, res) => {
  try {
    const { status } = req.body
    if (!['pending', 'sent', 'validated'].includes(status)) return res.status(400).json({ error: 'Statut invalide' })
    const bt = await prisma.bonTransport.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } })
    if (!bt) return res.status(404).json({ error: 'BT introuvable' })
    const updated = await prisma.bonTransport.update({ where: { id: req.params.id }, data: { status } })
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur interne' })
  }
})

// GET /api/billing/bt/:id/pdf
router.get('/bt/:id/pdf', async (req, res) => {
  try {
    const bt = await prisma.bonTransport.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } })
    if (!bt) return res.status(404).json({ error: 'BT introuvable' })

    const company = await prisma.company.findUnique({
      where: { id: req.user.companyId },
      select: { name: true, address: true, phone: true },
    })

    const { generateBTPDF } = require('../services/pdfService')
    const pdfBuffer = await generateBTPDF(bt, company)

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="BT-${bt.numero}.pdf"`)
    res.send(pdfBuffer)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur interne' })
  }
})

// POST /api/billing/bt/:id/signature — enregistrer la signature patient
router.post('/bt/:id/signature', async (req, res) => {
  try {
    const { signature } = req.body
    if (!signature) return res.status(400).json({ error: 'Signature requise' })
    const bt = await prisma.bonTransport.findFirst({ where: { id: req.params.id, companyId: req.user.companyId } })
    if (!bt) return res.status(404).json({ error: 'BT introuvable' })
    const updated = await prisma.bonTransport.update({ where: { id: req.params.id }, data: { signature } })
    res.json(updated)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur interne' })
  }
})

// GET /api/billing/export-sage?month=YYYY-MM — export format Sage
router.get('/export-sage', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7)
    const bts = await prisma.bonTransport.findMany({
      where: { companyId: req.user.companyId, date: { startsWith: month } },
      orderBy: { date: 'asc' },
    })
    const rows = ['JournalCode,EcritureDate,PieceRef,CompteNum,CompteLib,Debit,Credit,EcritureLib']
    for (const bt of bts) {
      const lib = `"Transport ${bt.patient}"`
      const amt = bt.amount.toFixed(2)
      rows.push(`VTE,${bt.date},${bt.numero},706100,"Prestations transport",0.00,${amt},${lib}`)
      rows.push(`VTE,${bt.date},${bt.numero},411000,"${bt.patient}",${amt},0.00,${lib}`)
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="sage-${month}.csv"`)
    res.send('﻿' + rows.join('\n'))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur interne' })
  }
})

// GET /api/billing/export-ebp?month=YYYY-MM — export format EBP
router.get('/export-ebp', async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7)
    const bts = await prisma.bonTransport.findMany({
      where: { companyId: req.user.companyId, date: { startsWith: month } },
      orderBy: { date: 'asc' },
    })
    const rows = ['Date;Journal;Pièce;Compte;Libellé;Débit;Crédit']
    for (const bt of bts) {
      const d = bt.date.split('-').reverse().join('/')
      const amt = bt.amount.toFixed(2).replace('.', ',')
      rows.push(`${d};VTE;${bt.numero};706100;Prestations transport;0,00;${amt}`)
      rows.push(`${d};VTE;${bt.numero};411000;${bt.patient};${amt};0,00`)
    }
    res.setHeader('Content-Type', 'text/csv; charset=utf-8')
    res.setHeader('Content-Disposition', `attachment; filename="ebp-${month}.csv"`)
    res.send('﻿' + rows.join('\n'))
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erreur interne' })
  }
})

// POST /api/billing/portal — ouvre le portail client Stripe (gérer/annuler l'abonnement)
router.post('/portal', async (req, res) => {
  try {
    if (!stripeEnabled) {
      return res.status(503).json({ error: 'Stripe non configuré', demo: true });
    }

    const company = await prisma.company.findUnique({ where: { id: req.user.companyId } });
    if (!company.stripeId) {
      return res.status(400).json({ error: 'Aucun abonnement Stripe associé à cette entreprise' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: company.stripeId,
      return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard`,
    });

    res.json({ portalUrl: session.url });
  } catch (err) {
    console.error('Erreur POST /billing/portal:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

module.exports = router;
