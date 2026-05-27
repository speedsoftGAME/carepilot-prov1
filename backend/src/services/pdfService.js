const PDFDocument = require('pdfkit')

/**
 * Génère un PDF de bon de transport au format A4
 * Retourne un Buffer
 */
function generateBTPDF(bt, company) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks = []
    doc.on('data', c => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const NAVY = '#0A1628'
    const BLUE = '#1565C0'
    const GRAY = '#64748B'
    const LIGHT = '#F0F4FF'

    // ── En-tête entreprise ──────────────────────────────────────
    doc.rect(50, 50, 495, 80).fill(NAVY)
    doc.fillColor('white').fontSize(18).font('Helvetica-Bold')
       .text('BON DE TRANSPORT', 60, 65)
    doc.fontSize(10).font('Helvetica')
       .text(`N° ${bt.numero}`, 60, 88)
    doc.fontSize(9)
       .text(company.name, 300, 65, { width: 235, align: 'right' })
    if (company.address) doc.text(company.address, 300, 78, { width: 235, align: 'right' })
    if (company.phone)   doc.text(company.phone,   300, 91, { width: 235, align: 'right' })

    // ── Infos générales ─────────────────────────────────────────
    doc.fillColor(NAVY).fontSize(10).font('Helvetica-Bold')
       .text('INFORMATIONS GÉNÉRALES', 50, 150)
    doc.moveTo(50, 163).lineTo(545, 163).strokeColor(BLUE).lineWidth(2).stroke()

    const row = (label, value, x, y, w = 220) => {
      doc.fillColor(GRAY).fontSize(8).font('Helvetica').text(label, x, y)
      doc.fillColor('#1F2937').fontSize(9).font('Helvetica-Bold')
         .text(value || '—', x, y + 12, { width: w })
    }

    row('Date', bt.date, 50, 172)
    row('Numéro BT', bt.numero, 300, 172)
    row('Statut', bt.status === 'validated' ? '✓ Validé' : bt.status === 'sent' ? '→ Envoyé' : '⏳ En attente', 50, 205)
    row('Montant', `${bt.amount?.toFixed(2)} €`, 300, 205)

    // ── Patient ─────────────────────────────────────────────────
    doc.rect(50, 240, 495, 20).fill(BLUE)
    doc.fillColor('white').fontSize(10).font('Helvetica-Bold')
       .text('PATIENT', 60, 245)

    doc.fillColor(NAVY).fontSize(10).font('Helvetica-Bold').text('', 50, 272)
    row('Nom & Prénom', bt.patient, 50, 270)
    if (bt.nss)     row('N° Sécurité Sociale', bt.nss, 300, 270)
    if (bt.mutuelle) row('Mutuelle', bt.mutuelle, 50, 303)
    if (bt.numMutuelle) row('N° Mutuelle', bt.numMutuelle, 300, 303)
    if (bt.ddn)     row('Date de naissance', bt.ddn, 50, 336)

    // ── Trajet ───────────────────────────────────────────────────
    doc.rect(50, 365, 495, 20).fill(BLUE)
    doc.fillColor('white').fontSize(10).font('Helvetica-Bold').text('TRAJET', 60, 370)

    row('Lieu de prise en charge', bt.from || '—', 50, 395)
    row('Destination', bt.to || '—', 50, 428)
    if (bt.type) row('Type de véhicule', bt.type, 300, 395)
    if (bt.trajet) row('Trajet', bt.trajet === 'aller' ? 'Aller' : bt.trajet === 'retour' ? 'Retour' : 'Aller-Retour', 300, 428)

    // ── Montant & Signature ──────────────────────────────────────
    doc.rect(50, 470, 495, 20).fill(NAVY)
    doc.fillColor('white').fontSize(10).font('Helvetica-Bold').text('FACTURATION', 60, 475)

    doc.rect(50, 498, 240, 80).strokeColor('#E2E8F0').lineWidth(1).stroke()
    doc.fillColor(GRAY).fontSize(8).font('Helvetica').text('Montant total', 60, 508)
    doc.fillColor(BLUE).fontSize(28).font('Helvetica-Bold')
       .text(`${bt.amount?.toFixed(2)} €`, 60, 520)

    doc.rect(310, 498, 235, 80).strokeColor('#E2E8F0').lineWidth(1).stroke()
    doc.fillColor(GRAY).fontSize(8).font('Helvetica').text('Signature & cachet', 320, 508)
    if (bt.signature) {
      try {
        const imgBuf = Buffer.from(bt.signature.replace(/^data:image\/png;base64,/, ''), 'base64')
        doc.image(imgBuf, 315, 518, { width: 220, height: 55 })
      } catch {}
    } else {
      doc.fillColor('#CBD5E1').fontSize(8).text('(signature du patient)', 320, 555)
    }

    // ── Notes ────────────────────────────────────────────────────
    if (bt.notes) {
      doc.fillColor(GRAY).fontSize(8).font('Helvetica').text('Observations :', 50, 595)
      doc.fillColor('#1F2937').fontSize(9).text(bt.notes, 50, 607, { width: 495 })
    }

    // ── Pied de page ─────────────────────────────────────────────
    doc.rect(50, 760, 495, 30).fill(LIGHT)
    doc.fillColor(GRAY).fontSize(7).font('Helvetica')
       .text(`Document généré par CarePilot Pro · ${new Date().toLocaleDateString('fr-FR')} · ${company.name}`, 60, 769, { width: 480, align: 'center' })

    doc.end()
  })
}

module.exports = { generateBTPDF }
