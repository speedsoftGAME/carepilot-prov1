export default function HeuresPanel() {
  const salaries = [
    { nom: "Jean Dupont", semaine: 38.5, mois: 151.5, conges: 12, role: "DEA" },
    { nom: "Marie Martin", semaine: 35, mois: 140, conges: 18, role: "DEA" },
    { nom: "Paul Bernard", semaine: 32, mois: 128, conges: 5, role: "Auxiliaire" },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: "#0A1628" }}>Heures & Congés</h2>
          <p className="text-xs" style={{ color: "#64748B" }}>Semaine 21 — Mai 2026</p>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border hover:bg-gray-50" style={{ color: "#1565C0" }}>
          ⬇ Exporter CSV
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#F0F4FF" }}>
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b" style={{ background: "#F0F4FF" }}>
                {["Salarié", "Rôle", "Heures semaine", "Heures mois", "Solde congés"].map(h => (
                  <th key={h} className="px-4 py-2 text-left text-xs font-semibold" style={{ color: "#64748B" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {salaries.map((s, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-blue-50 transition">
                  <td className="px-4 py-3 font-semibold" style={{ color: "#1F2937" }}>{s.nom}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: "#1565C022", color: "#1565C0" }}>{s.role}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: s.semaine > 35 ? "#FF6D00" : "#1F2937" }}>
                    {s.semaine}h {s.semaine > 35 && <span className="text-xs">⚠ HS</span>}
                  </td>
                  <td className="px-4 py-3 font-semibold" style={{ color: "#1F2937" }}>{s.mois}h</td>
                  <td className="px-4 py-3">
                    <span className="font-semibold" style={{ color: s.conges < 10 ? "#F44336" : "#00C853" }}>{s.conges}j</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs" style={{ color: "#92400E" }}>
          ⚠ Jean Dupont — 3h30 d'heures supplémentaires cette semaine. Vérifier avec le planning.
        </div>
        <p className="text-xs text-center pt-1" style={{ color: "#94A3B8" }}>
          Fonctionnalité disponible — développement complet prévu phase 2
        </p>
      </div>
    </div>
  );
}
