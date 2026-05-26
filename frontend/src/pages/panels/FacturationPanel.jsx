export default function FacturationPanel() {
  const bons = [
    { num: "BT-2026-001", patient: "Robert Dubois", date: "24/05/2026", trajet: "Voiron → CHU Grenoble", montant: "68,50 €", statut: "Validé" },
    { num: "BT-2026-002", patient: "Sophie Lefèvre", date: "25/05/2026", trajet: "Échirolles → Clinique Belledonne", montant: "42,00 €", statut: "En attente" },
    { num: "BT-2026-003", patient: "Henri Moreau", date: "26/05/2026", trajet: "EHPAD Les Pins → CHU Grenoble", montant: "55,20 €", statut: "Envoyé" },
  ];
  const statutColor = { "Validé": { bg: "#00C85322", text: "#00C853" }, "En attente": { bg: "#FF6D0022", text: "#FF6D00" }, "Envoyé": { bg: "#2196F322", text: "#2196F3" } };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: "#0A1628" }}>Facturation — Bons de Transport</h2>
          <p className="text-xs" style={{ color: "#64748B" }}>Gestion des BTI / BT Cerfa</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border hover:bg-gray-50" style={{ color: "#1565C0" }}>Exporter</button>
          <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "#1565C0" }}>Générer BT</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#F0F4FF" }}>
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ background: "#F0F4FF" }}>
                {["N° BT", "Patient", "Date", "Trajet", "Montant", "Statut", ""].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-semibold" style={{ color: "#64748B" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bons.map((b, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-blue-50 transition">
                  <td className="px-4 py-3 font-mono text-xs font-semibold" style={{ color: "#1565C0" }}>{b.num}</td>
                  <td className="px-4 py-3 font-medium" style={{ color: "#1F2937" }}>{b.patient}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#64748B" }}>{b.date}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#64748B" }}>{b.trajet}</td>
                  <td className="px-4 py-3 font-semibold text-sm" style={{ color: "#1F2937" }}>{b.montant}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: statutColor[b.statut].bg, color: statutColor[b.statut].text }}>{b.statut}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-xs px-2 py-1 rounded-lg border hover:bg-gray-50" style={{ color: "#64748B" }}>PDF</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-center pt-1" style={{ color: "#94A3B8" }}>
          PDF Cerfa automatique — Fonctionnalité disponible — développement complet prévu phase 2
        </p>
      </div>
    </div>
  );
}
