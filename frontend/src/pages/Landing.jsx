import { Link } from 'react-router-dom'

const FEATURES = [
  { icon: '🚑', title: 'Gestion des missions', desc: 'Créez, assignez et suivez vos transports en temps réel. Priorités, types de véhicule, statuts — tout en un coup d\'œil.' },
  { icon: '🗺️', title: 'GPS temps réel', desc: 'Localisez votre flotte sur une carte interactive. Chaque véhicule envoie sa position en direct via PWA mobile.' },
  { icon: '🤖', title: 'Dispatch IA', desc: 'Notre IA suggère le meilleur véhicule disponible selon la distance, les priorités et le type de transport requis.' },
  { icon: '📄', title: 'Bons de transport', desc: 'Générez automatiquement vos BT à la fin d\'une mission. Signature électronique patient sur tablette incluse.' },
  { icon: '👥', title: 'RH & Planning', desc: 'Pointeuse PIN, planning hebdomadaire, export paie CSV. Gérez vos équipes sans quitter l\'application.' },
  { icon: '📊', title: 'Statistiques & CA', desc: 'Chiffre d\'affaires, taux d\'occupation, missions par véhicule. Export Sage ou EBP en un clic.' },
]

const PLANS = [
  {
    name: 'Starter', price: '49', color: '#64748B',
    features: ['3 véhicules', '5 employés', '50 analyses OKCare/mois', 'GPS temps réel', 'BT automatiques', 'Support email'],
    cta: 'Démarrer',
  },
  {
    name: 'Pro', price: '149', color: '#1565C0', badge: '⭐ Populaire',
    features: ['Véhicules illimités', 'Employés illimités', '500 analyses OKCare/mois', 'Multi-sites', 'API publique', 'Export Sage / EBP', 'Support prioritaire'],
    cta: 'Essai 14 jours gratuit',
  },
  {
    name: 'Enterprise', price: '399', color: '#7C3AED',
    features: ['Tout du plan Pro', '9 999 analyses OKCare', 'Intégration SAMU directe', 'White-label personnalisé', 'Formation & onboarding', 'SLA 99,9%'],
    cta: 'Nous contacter',
  },
]

const S = {
  nav: { background: '#0A1628', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 100 },
  hero: { background: 'linear-gradient(135deg, #0A1628 0%, #0D2347 55%, #1565C0 100%)', padding: '100px 32px', textAlign: 'center' },
  statsBar: { background: '#0D2347', padding: '32px', display: 'flex', justifyContent: 'center', gap: 64 },
  section: (bg) => ({ padding: '80px 32px', background: bg }),
  wrap: { maxWidth: 1100, margin: '0 auto' },
  sectionTitle: { textAlign: 'center', marginBottom: 52 },
  card: { background: 'white', borderRadius: 16, padding: 28, border: '1px solid #E2E8F0' },
  btn: (bg, color, border) => ({ background: bg, color, border: border || 'none', padding: '14px 32px', borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: 'none', display: 'inline-block', cursor: 'pointer' }),
}

export default function Landing() {
  return (
    <div style={{ fontFamily: 'system-ui,-apple-system,sans-serif', background: '#fff', color: '#1F2937' }}>

      {/* Nav */}
      <nav style={S.nav}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 26 }}>🚑</span>
          <span style={{ color: 'white', fontWeight: 800, fontSize: 18 }}>CarePilot Pro</span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="#fonctionnalites" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14 }}>Fonctionnalités</a>
          <a href="#tarifs" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14 }}>Tarifs</a>
          <Link to="/login" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: 14 }}>Connexion</Link>
          <Link to="/login" style={S.btn('#1565C0', 'white')}>Essai gratuit</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={S.hero}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <span style={{ background: 'rgba(33,150,243,0.2)', color: '#90CAF9', padding: '5px 18px', borderRadius: 20, fontSize: 13, fontWeight: 600, border: '1px solid rgba(33,150,243,0.3)' }}>
            Nouveau — Intégration SAMU &amp; White-label disponibles
          </span>
          <h1 style={{ color: 'white', fontSize: 54, fontWeight: 800, marginTop: 24, lineHeight: 1.15, marginBottom: 20 }}>
            La régulation ambulancière<br />réinventée pour 2026
          </h1>
          <p style={{ color: '#93C5FD', fontSize: 19, lineHeight: 1.7, marginBottom: 40 }}>
            CarePilot Pro centralise vos missions, votre flotte et vos équipes<br />
            dans une seule application conçue pour les ambulanciers français.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" style={S.btn('white', '#1565C0')}>
              Démarrer gratuitement →
            </Link>
            <a href="#fonctionnalites" style={S.btn('rgba(255,255,255,0.08)', 'white', '1px solid rgba(255,255,255,0.25)')}>
              Voir les fonctionnalités
            </a>
          </div>
          <p style={{ color: '#64748B', fontSize: 13, marginTop: 20 }}>
            Aucune carte bancaire requise · Annulation à tout moment
          </p>
        </div>
      </section>

      {/* Stats */}
      <section style={S.statsBar}>
        {[
          { value: '120+', label: 'Sociétés ambulancières' },
          { value: '8 500+', label: 'Missions/mois gérées' },
          { value: '99,9%', label: 'Disponibilité garantie' },
          { value: '< 2 min', label: 'Temps moyen de dispatch' },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center' }}>
            <div style={{ color: '#2196F3', fontSize: 32, fontWeight: 800 }}>{s.value}</div>
            <div style={{ color: '#64748B', fontSize: 13, marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="fonctionnalites" style={S.section('#F0F4FF')}>
        <div style={S.wrap}>
          <div style={S.sectionTitle}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0A1628', margin: 0 }}>Tout ce dont vous avez besoin</h2>
            <p style={{ color: '#64748B', marginTop: 10, fontSize: 17 }}>Une suite complète pour la régulation ambulancière moderne</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {FEATURES.map(f => (
              <div key={f.title} style={S.card}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: 17, color: '#1F2937', marginBottom: 8, marginTop: 0 }}>{f.title}</h3>
                <p style={{ color: '#64748B', fontSize: 14, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Screenshot placeholder */}
      <section style={S.section('#fff')}>
        <div style={{ ...S.wrap, textAlign: 'center' }}>
          <div style={{ background: '#0A1628', borderRadius: 20, padding: 40, display: 'inline-block', width: '100%', maxWidth: 800 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
              {['#F44336','#FF6D00','#00C853'].map(c => <div key={c} style={{ width: 12, height: 12, borderRadius: '50%', background: c }} />)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
              {[
                { label: 'Missions aujourd\'hui', value: '8', color: '#2196F3' },
                { label: 'En cours', value: '3', color: '#FF6D00' },
                { label: 'CA du jour', value: '1 248 €', color: '#00C853' },
              ].map(s => (
                <div key={s.label} style={{ background: '#0D2347', borderRadius: 12, padding: '16px 20px', textAlign: 'center' }}>
                  <div style={{ color: s.color, fontSize: 28, fontWeight: 800 }}>{s.value}</div>
                  <div style={{ color: '#64748B', fontSize: 11, marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{ background: '#0D2347', borderRadius: 12, padding: 16, marginTop: 12, textAlign: 'left' }}>
              {['M-2026-001 · Robert Dubois · Voiron → CHU Grenoble · 🔴 Urgent', 'M-2026-002 · Sophie Lefèvre · EHPAD → Clinique · ⚪ Normal'].map(t => (
                <div key={t} style={{ color: '#94A3B8', fontSize: 12, padding: '6px 0', borderBottom: '1px solid #1F3150' }}>{t}</div>
              ))}
            </div>
          </div>
          <p style={{ color: '#94A3B8', fontSize: 13, marginTop: 16 }}>Interface tableau de bord CarePilot Pro</p>
        </div>
      </section>

      {/* Pricing */}
      <section id="tarifs" style={S.section('#F0F4FF')}>
        <div style={S.wrap}>
          <div style={S.sectionTitle}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: '#0A1628', margin: 0 }}>Tarifs transparents</h2>
            <p style={{ color: '#64748B', marginTop: 10, fontSize: 17 }}>Sans engagement · Résiliable à tout moment · Facture mensuelle</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24 }}>
            {PLANS.map(p => (
              <div key={p.name} style={{ background: 'white', borderRadius: 20, padding: 32, border: `2px solid ${p.badge ? p.color : '#E2E8F0'}`, position: 'relative' }}>
                {p.badge && (
                  <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: p.color, color: 'white', padding: '4px 20px', borderRadius: 20, fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap' }}>
                    {p.badge}
                  </div>
                )}
                <h3 style={{ fontWeight: 800, fontSize: 22, color: '#1F2937', margin: '0 0 16px' }}>{p.name}</h3>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontSize: 48, fontWeight: 800, color: p.color }}>{p.price}€</span>
                  <span style={{ color: '#94A3B8', fontSize: 15 }}>/mois</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', gap: 8, marginBottom: 10, color: '#374151', fontSize: 14, alignItems: 'flex-start' }}>
                      <span style={{ color: '#00C853', fontWeight: 700, flexShrink: 0 }}>✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link to="/login" style={{ display: 'block', textAlign: 'center', background: p.badge ? p.color : 'transparent', color: p.badge ? 'white' : p.color, border: `2px solid ${p.color}`, padding: '12px 0', borderRadius: 10, fontWeight: 700, textDecoration: 'none', fontSize: 15 }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: 'linear-gradient(135deg, #0A1628, #1565C0)', padding: '80px 32px', textAlign: 'center' }}>
        <h2 style={{ color: 'white', fontSize: 36, fontWeight: 800, margin: '0 0 12px' }}>Prêt à moderniser votre régulation ?</h2>
        <p style={{ color: '#93C5FD', fontSize: 17, margin: '0 0 36px' }}>Rejoignez les sociétés ambulancières françaises qui font confiance à CarePilot Pro</p>
        <Link to="/login" style={S.btn('white', '#1565C0')}>
          Créer un compte gratuit →
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ background: '#0A1628', padding: '32px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 16 }}>
          <span style={{ fontSize: 22 }}>🚑</span>
          <span style={{ color: 'white', fontWeight: 700 }}>CarePilot Pro</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 12 }}>
          {['Connexion', 'Créer un compte', 'Fonctionnalités', 'Tarifs'].map(l => (
            <a key={l} href={l === 'Fonctionnalités' ? '#fonctionnalites' : l === 'Tarifs' ? '#tarifs' : '/login'} style={{ color: '#64748B', textDecoration: 'none', fontSize: 13 }}>{l}</a>
          ))}
        </div>
        <p style={{ color: '#475569', fontSize: 12, margin: 0 }}>© 2026 CarePilot Pro — Régulation ambulancière intelligente pour le marché français</p>
      </footer>
    </div>
  )
}
