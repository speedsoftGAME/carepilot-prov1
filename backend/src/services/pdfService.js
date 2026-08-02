const PDFDocument = require('pdfkit')

function generateBTPDF(bt, company) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0 })
    const chunks = []
    doc.on('data', c => chunks.push(c))
    doc.on('end', () => resolve(Buffer.concat(chunks)))
    doc.on('error', reject)

    const W = 595, H = 842
    const M = 28 // margin
    const NAVY = '#0A1628', BLUE = '#1565C0', GRAY = '#64748B'
    const LGRAY = '#94A3B8', BORDER = '#CBD5E1', LBLUE = '#EFF6FF'

    // ── Cadre principal ──────────────────────────────────────────
    doc.rect(M, M, W - M * 2, H - M * 2).strokeColor(BORDER).lineWidth(1).stroke()

    // ── Bandeau titre ────────────────────────────────────────────
    doc.rect(M, M, W - M * 2, 52).fill(NAVY)
    doc.fillColor('white').fontSize(14).font('Helvetica-Bold')
       .text('BON DE TRANSPORT SANITAIRE', M + 10, M + 8, { width: 370 })
    doc.fontSize(8).font('Helvetica')
       .text('Formulaire de prise en charge — Assurance Maladie', M + 10, M + 27)
    doc.fontSize(9).font('Helvetica-Bold')
       .text(`N° ${bt.numero}`, W - M - 140, M + 10, { width: 130, align: 'right' })
    doc.fontSize(8).font('Helvetica')
       .text(`Date : ${bt.date}`, W - M - 140, M + 26, { width: 130, align: 'right' })

    // ── Référence Cerfa ──────────────────────────────────────────
    doc.fillColor(LGRAY).fontSize(7).font('Helvetica')
       .text('Cerfa réf. S 3140 b — Transport ambulancier', W - M - 160, M + 40, { width: 150, align: 'right' })

    let y = M + 62

    // ─── Section 1 : Organisme / Transporteur ────────────────────
    sectionHeader(doc, 'TRANSPORTEUR (Société)', M, y, W, BLUE)
    y += 18
    const col = (label, val, x, width) => {
      doc.fillColor(LGRAY).fontSize(7).font('Helvetica').text(label, x, y + 1, { width })
      doc.fillColor('#1F2937').fontSize(8.5).font('Helvetica-Bold').text(val || '—', x, y + 11, { width })
    }
    col('Raison sociale', company.name, M + 6, 200)
    col('SIRET', company.siret || '—', M + 214, 140)
    col('Téléphone', company.phone || '—', M + 362, 130)
    y += 30

    doc.fillColor(LGRAY).fontSize(7).font('Helvetica').text('Adresse', M + 6, y + 1)
    doc.fillColor('#1F2937').fontSize(8.5).font('Helvetica').text(company.address || '—', M + 6, y + 11, { width: W - M * 2 - 12 })
    y += 30

    divider(doc, M, y, W, BORDER); y += 6

    // ─── Section 2 : Patient / Assuré ────────────────────────────
    sectionHeader(doc, 'PATIENT / ASSURÉ', M, y, W, BLUE)
    y += 18
    col('Nom & Prénom', bt.patient, M + 6, 220)
    if (bt.nss) col('N° Sécurité Sociale', formatNSS(bt.nss), M + 234, 130)
    if (bt.ddn) col('Date de naissance', bt.ddn, M + 372, 130)
    y += 30

    col('Mutuelle / Organisme complémentaire', bt.mutuelle || '—', M + 6, 200)
    if (bt.numMutuelle) col('N° Adhérent', bt.numMutuelle, M + 214, 130)
    col('Exonération TM', '□ Oui  ■ Non', M + 352, 140)
    y += 30

    divider(doc, M, y, W, BORDER); y += 6

    // ─── Section 3 : Prescription médicale ──────────────────────
    sectionHeader(doc, 'PRESCRIPTION MÉDICALE', M, y, W, BLUE)
    y += 18
    col('Médecin prescripteur', bt.medecin || 'Non renseigné', M + 6, 220)
    col('Date de prescription', bt.date, M + 234, 130)
    col('N° RPPS', '—', M + 372, 130)
    y += 30
    col('Motif médical du transport', bt.obs || 'Transport médical prescrit', M + 6, W - M * 2 - 12)
    y += 30

    divider(doc, M, y, W, BORDER); y += 6

    // ─── Section 4 : Nature du transport ─────────────────────────
    sectionHeader(doc, 'NATURE DU TRANSPORT', M, y, W, BLUE)
    y += 18

    const typeLabel = { AMB: 'Ambulance (AMB)', VSL: 'VSL', SMUR: 'SMUR', TAXI: 'Taxi conventionné' }
    const trajetLabel = { aller: 'Aller simple', retour: 'Retour simple', 'aller-retour': 'Aller-Retour' }

    col('Type de véhicule', typeLabel[bt.type] || bt.type || 'AMB', M + 6, 175)
    col('Nature du trajet', trajetLabel[bt.trajet] || bt.trajet || 'Aller simple', M + 189, 140)
    col('Caractère', bt.priority === 'urgent' ? '🔴 Urgent' : '⚪ Programme', M + 337, 130)
    y += 30

    divider(doc, M, y, W, BORDER); y += 6

    // ─── Section 5 : Trajet ───────────────────────────────────────
    sectionHeader(doc, 'DÉTAIL DU TRAJET', M, y, W, BLUE)
    y += 18
    col('Lieu de prise en charge', bt.from || '—', M + 6, W - M * 2 - 12)
    y += 28
    col('Lieu de destination', bt.to || '—', M + 6, W - M * 2 - 12)
    y += 30

    // Case distance / montant
    doc.rect(M + 6, y, 165, 36).fill(LBLUE).stroke()
    doc.rect(M + 179, y, 165, 36).fill(LBLUE).stroke()
    doc.rect(M + 352, y, W - M * 2 - 358, 36).fill('#F0FFF4').stroke()

    doc.fillColor(LGRAY).fontSize(7).text('Distance (km)', M + 10, y + 3)
    doc.fillColor(LGRAY).fontSize(7).text('Tarif de base', M + 183, y + 3)
    doc.fillColor(LGRAY).fontSize(7).text('MONTANT TOTAL', M + 356, y + 3)
    doc.fillColor('#1F2937').fontSize(14).font('Helvetica-Bold')
       .text('—', M + 10, y + 14, { width: 155, align: 'center' })
       .text('—', M + 179, y + 14, { width: 165, align: 'center' })
    doc.fillColor('#059669').fontSize(16).font('Helvetica-Bold')
       .text(`${(bt.amount || 0).toFixed(2)} €`, M + 352, y + 13, { width: W - M * 2 - 358, align: 'center' })
    y += 44

    divider(doc, M, y, W, BORDER); y += 6

    // ─── Section 6 : Signatures ────────────────────────────────
    sectionHeader(doc, 'ATTESTATION ET SIGNATURES', M, y, W, BLUE)
    y += 18

    const sigW = Math.floor((W - M * 2 - 20) / 3)
    const sigBoxes = [
      { label: 'Signature du transporteur', x: M + 4 },
      { label: 'Signature du patient\n(ou représentant légal)', x: M + 4 + sigW + 6 },
      { label: 'Cachet et signature\ndu médecin prescripteur', x: M + 4 + (sigW + 6) * 2 },
    ]

    sigBoxes.forEach(({ label, x }) => {
      doc.rect(x, y, sigW, 68).strokeColor(BORDER).lineWidth(1).stroke()
      doc.fillColor(LGRAY).fontSize(7).font('Helvetica').text(label, x + 4, y + 4, { width: sigW - 8 })
    })

    // Signature patient (base64 si disponible)
    if (bt.signature) {
      try {
        const imgBuf = Buffer.from(bt.signature.replace(/^data:image\/png;base64,/, ''), 'base64')
        doc.image(imgBuf, sigBoxes[1].x + 4, y + 16, { width: sigW - 8, height: 48 })
      } catch {}
    } else {
      doc.fillColor('#CBD5E1').fontSize(8).text('(à compléter)', sigBoxes[1].x + 4, y + 38, { width: sigW - 8, align: 'center' })
    }

    doc.fillColor('#CBD5E1').fontSize(8).text('(à compléter)', sigBoxes[0].x + 4, y + 38, { width: sigW - 8, align: 'center' })
    doc.fillColor('#CBD5E1').fontSize(8).text('(à compléter)', sigBoxes[2].x + 4, y + 38, { width: sigW - 8, align: 'center' })
    y += 76

    // ─── Notes ───────────────────────────────────────────────────
    if (bt.notes) {
      divider(doc, M, y, W, BORDER); y += 6
      doc.fillColor(LGRAY).fontSize(7).font('Helvetica').text('Observations / Remarques :', M + 6, y)
      doc.fillColor('#1F2937').fontSize(8.5).text(bt.notes, M + 6, y + 10, { width: W - M * 2 - 12 })
      y += 26
    }

    // ─── Pied de page ────────────────────────────────────────────
    const footerY = H - M - 26
    doc.rect(M, footerY, W - M * 2, 26).fill('#F8FAFC')
    doc.moveTo(M, footerY).lineTo(W - M, footerY).strokeColor(BORDER).lineWidth(0.5).stroke()
    doc.fillColor(LGRAY).fontSize(6.5).font('Helvetica')
       .text(
         `Document généré par CarePilot Pro · ${new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })} à ${new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} · ${company.name}`,
         M + 6, footerY + 5, { width: (W - M * 2) / 2 - 10 }
       )
    doc.text(
      'Ce document est conforme aux exigences de la convention nationale des transporteurs sanitaires privés.',
      W / 2, footerY + 5, { width: (W - M * 2) / 2 - 6, align: 'right' }
    )

    doc.end()
  })
}

function sectionHeader(doc, title, x, y, W, color) {
  const M = 28
  doc.rect(x, y, W - x * 2 + M, 16).fill(color + '18') // très léger
  doc.moveTo(x, y).lineTo(W - M, y).strokeColor(color).lineWidth(1.5).stroke()
  doc.fillColor(color).fontSize(8).font('Helvetica-Bold')
     .text(title, x + 6, y + 4)
}

function divider(doc, x, y, W, color) {
  doc.moveTo(x + 1, y).lineTo(W - x - 1, y).strokeColor(color).lineWidth(0.5).stroke()
}

function formatNSS(nss) {
  if (!nss || nss.length < 13) return nss || '—'
  const n = nss.replace(/\s/g, '')
  return `${n.slice(0, 1)} ${n.slice(1, 3)} ${n.slice(3, 5)} ${n.slice(5, 7)} ${n.slice(7, 10)} ${n.slice(10, 13)}${n.length > 13 ? ' ' + n.slice(13) : ''}`
}

module.exports = { generateBTPDF }
