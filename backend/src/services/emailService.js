const nodemailer = require('nodemailer')

function createTransporter() {
  if (!process.env.SMTP_HOST) return null
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
}

async function send({ to, subject, html }) {
  const transporter = createTransporter()
  if (!transporter) {
    console.log(`\n📧 [EMAIL DEV] To: ${to} | Subject: ${subject}`)
    console.log(html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
    return
  }
  await transporter.sendMail({
    from: `"${process.env.SMTP_FROM_NAME || 'CarePilot Pro'}" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
    to, subject, html,
  })
}

const BASE = (content) => `
<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;border:1px solid #E2E8F0">
  <div style="background:#0A1628;padding:24px;text-align:center">
    <span style="font-size:28px">🚑</span>
    <h1 style="color:white;margin:8px 0 0;font-size:20px;font-weight:700">CarePilot Pro</h1>
  </div>
  <div style="padding:32px">${content}</div>
  <div style="padding:16px;text-align:center;background:#F8FAFC;border-top:1px solid #E2E8F0">
    <p style="color:#94A3B8;font-size:12px;margin:0">CarePilot Pro — Régulation ambulancière intelligente</p>
  </div>
</div>`

async function sendPasswordReset(email, name, resetUrl) {
  await send({
    to: email,
    subject: 'Réinitialisation de votre mot de passe — CarePilot Pro',
    html: BASE(`
      <h2 style="color:#1F2937;margin-top:0">Réinitialisation du mot de passe</h2>
      <p style="color:#64748B">Bonjour ${name || email},</p>
      <p style="color:#64748B">Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous :</p>
      <div style="text-align:center;margin:32px 0">
        <a href="${resetUrl}" style="background:#1565C0;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
          Réinitialiser mon mot de passe
        </a>
      </div>
      <p style="color:#94A3B8;font-size:13px">Ce lien expire dans <strong>1 heure</strong>. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
    `),
  })
}

async function sendWelcome(email, name, companyName, loginUrl) {
  await send({
    to: email,
    subject: `Bienvenue sur CarePilot Pro — ${companyName}`,
    html: BASE(`
      <h2 style="color:#1F2937;margin-top:0">Bienvenue, ${name || email} ! 👋</h2>
      <p style="color:#64748B">Votre espace <strong>${companyName}</strong> a été créé avec succès.</p>
      <p style="color:#64748B">Vous pouvez dès maintenant :</p>
      <ul style="color:#64748B;padding-left:20px">
        <li>Ajouter vos véhicules et salariés</li>
        <li>Créer vos premières missions</li>
        <li>Activer le GPS temps réel</li>
      </ul>
      <div style="text-align:center;margin:32px 0">
        <a href="${loginUrl}" style="background:#1565C0;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;display:inline-block">
          Accéder à mon tableau de bord →
        </a>
      </div>
      <p style="color:#94A3B8;font-size:13px">Plan actuel : <strong>Starter</strong>. Passez au plan Pro pour débloquer les fonctionnalités avancées.</p>
    `),
  })
}

async function sendMissionAlert(email, mission) {
  await send({
    to: email,
    subject: `🚨 Mission urgente — ${mission.numero}`,
    html: BASE(`
      <h2 style="color:#F44336;margin-top:0">🚨 Nouvelle mission urgente</h2>
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr><td style="padding:8px;color:#64748B;font-weight:600">Mission</td><td style="padding:8px;color:#1F2937">${mission.numero}</td></tr>
        <tr style="background:#F8FAFC"><td style="padding:8px;color:#64748B;font-weight:600">Patient</td><td style="padding:8px;color:#1F2937">${mission.patient}</td></tr>
        <tr><td style="padding:8px;color:#64748B;font-weight:600">De</td><td style="padding:8px;color:#1F2937">${mission.from}</td></tr>
        <tr style="background:#F8FAFC"><td style="padding:8px;color:#64748B;font-weight:600">Vers</td><td style="padding:8px;color:#1F2937">${mission.to}</td></tr>
        <tr><td style="padding:8px;color:#64748B;font-weight:600">Heure</td><td style="padding:8px;color:#1F2937">${mission.time || 'Dès que possible'}</td></tr>
      </table>
    `),
  })
}

module.exports = { send, sendPasswordReset, sendWelcome, sendMissionAlert }
