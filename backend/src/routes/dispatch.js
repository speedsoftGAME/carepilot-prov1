const express = require('express');
const axios = require('axios');
const Anthropic = require('@anthropic-ai/sdk');
const { PrismaClient } = require('@prisma/client');
const authMiddleware = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

router.use(authMiddleware);

// Calcule la distance en km entre deux coordonnées GPS (formule Haversine)
function haversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Géocode une adresse via Nominatim (OpenStreetMap, gratuit, sans clé API)
async function geocode(address) {
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: address, format: 'json', limit: 1, countrycodes: 'fr' },
      headers: { 'User-Agent': 'CarePilot-Pro/1.0 (contact@carepilot.fr)' },
      timeout: 5000,
    });
    if (!response.data.length) return null;
    const { lat, lon, display_name } = response.data[0];
    return { lat: parseFloat(lat), lng: parseFloat(lon), label: display_name };
  } catch {
    return null;
  }
}

// POST /api/dispatch/suggest — suggère le meilleur véhicule pour une mission
// Body : { missionId } OU { from, to, type, priority }
router.post('/suggest', async (req, res) => {
  try {
    const { missionId } = req.body;
    let { from, to, type = 'AMB', priority = 'normal', patient } = req.body;

    // Si un missionId est fourni, on charge les données depuis la BDD
    if (missionId) {
      const mission = await prisma.mission.findFirst({
        where: { id: missionId, companyId: req.user.companyId },
      });
      if (!mission) return res.status(404).json({ error: 'Mission introuvable' });
      from = mission.from;
      to = mission.to;
      type = mission.type;
      priority = mission.priority;
      patient = mission.patient;
    }

    if (!from || !to) {
      return res.status(400).json({ error: 'Les adresses de départ (from) et d\'arrivée (to) sont requises' });
    }

    // 1. Géocodage de l'adresse de prise en charge
    const pickupCoords = await geocode(from);
    if (!pickupCoords) {
      return res.status(422).json({ error: `Adresse introuvable : "${from}". Essaie avec une adresse plus précise.` });
    }

    // 2. Récupération des véhicules disponibles (ou tous si aucun disponible)
    let vehicles = await prisma.vehicle.findMany({
      where: { companyId: req.user.companyId, status: 'available' },
    });

    if (vehicles.length === 0) {
      vehicles = await prisma.vehicle.findMany({
        where: { companyId: req.user.companyId },
      });
    }

    if (vehicles.length === 0) {
      return res.status(404).json({ error: 'Aucun véhicule enregistré dans la flotte' });
    }

    // 3. Calcul des distances Haversine pour chaque véhicule
    const vehiclesWithDistance = vehicles.map((v) => {
      let distance = null;
      if (v.lat && v.lng) {
        distance = haversine(v.lat, v.lng, pickupCoords.lat, pickupCoords.lng);
      }
      return { ...v, distanceKm: distance !== null ? Math.round(distance * 10) / 10 : null };
    });

    // Tri par distance croissante (les véhicules sans GPS passent en dernier)
    vehiclesWithDistance.sort((a, b) => {
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });

    // 4. Appel à Claude pour la suggestion IA
    let suggestion = null;
    const hasApiKey = process.env.ANTHROPIC_API_KEY && !process.env.ANTHROPIC_API_KEY.startsWith('sk-ant-...');

    if (hasApiKey) {
      const vehicleList = vehiclesWithDistance
        .map((v) => {
          const dist = v.distanceKm !== null ? `${v.distanceKm} km` : 'position inconnue';
          return `- ${v.name} (${v.type}) | statut: ${v.status} | distance au patient: ${dist}${v.crew ? ` | équipage: ${v.crew}` : ''}`;
        })
        .join('\n');

      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 400,
        system:
          'Tu es un régulateur ambulancier expert. Tu analyses les données de la flotte et tu recommandes le véhicule optimal pour une mission. Réponds toujours en JSON valide avec les clés : vehicleName (string), reasoning (string en français, 2-3 phrases max), urgencyNote (string ou null).',
        messages: [
          {
            role: 'user',
            content: `Mission à dispatcher :
- Patient : ${patient || 'Non renseigné'}
- Prise en charge : ${from}
- Destination : ${to}
- Type de véhicule requis : ${type}
- Priorité : ${priority}

Flotte disponible :
${vehicleList}

Quel véhicule recommandes-tu et pourquoi ?`,
          },
        ],
      });

      try {
        const raw = message.content[0].text.trim();
        const jsonStr = raw.startsWith('{') ? raw : raw.match(/\{[\s\S]*\}/)?.[0];
        suggestion = JSON.parse(jsonStr);
      } catch {
        suggestion = { vehicleName: null, reasoning: message.content[0].text, urgencyNote: null };
      }
    }

    // 5. Réponse finale
    res.json({
      pickup: pickupCoords,
      vehicles: vehiclesWithDistance,
      suggestion: suggestion || {
        vehicleName: vehiclesWithDistance[0]?.name || null,
        reasoning: vehiclesWithDistance[0]
          ? `${vehiclesWithDistance[0].name} est le véhicule le plus proche (${vehiclesWithDistance[0].distanceKm ?? '?'} km).`
          : 'Aucun véhicule disponible.',
        urgencyNote: priority === 'urgent' ? 'Mission urgente — intervention immédiate requise.' : null,
      },
      aiEnabled: hasApiKey,
    });
  } catch (err) {
    console.error('Erreur POST /dispatch/suggest:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

// POST /api/dispatch/geocode — géocode une adresse (utilisé par le frontend pour la carte)
router.post('/geocode', async (req, res) => {
  try {
    const { address } = req.body;
    if (!address) return res.status(400).json({ error: 'Adresse requise' });

    const coords = await geocode(address);
    if (!coords) return res.status(404).json({ error: `Adresse introuvable : "${address}"` });

    res.json(coords);
  } catch (err) {
    console.error('Erreur POST /dispatch/geocode:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
});

module.exports = router;
