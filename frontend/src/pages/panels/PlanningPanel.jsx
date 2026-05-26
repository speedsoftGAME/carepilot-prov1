export default function PlanningPanel() {
  const days = ["Lun 26", "Mar 27", "Mer 28", "Jeu 29", "Ven 30", "Sam 31", "Dim 1"];
  const employees = [
    {
      nom: "Jean Dupont",
      shifts: ["Matin 06:00–14:00", "Matin 06:00–14:00", "Repos", "Soir 14:00–22:00", "Soir 14:00–22:00", "Repos", "Repos"],
    },
    {
      nom: "Marie Martin",
      shifts: ["Soir 14:00–22:00", "Repos", "Matin 06:00–14:00", "Matin 06:00–14:00", "Repos", "Matin 06:00–14:00", "Repos"],
    },
    {
      nom: "Paul Bernard",
      shifts: ["Repos", "Soir 14:00–22:00", "Soir 14:00–22:00", "Repos", "Matin 06:00–14:00", "Soir 14:00–22:00", "Repos"],
    },
  ];

  const shiftStyle = (shift) => {
    if (shift === "Repos") return { bg: "#F1F5F9", color: "#94A3B8" };
    if (shift.startsWith("Matin")) return { bg: "#E3F2FD", color: "#1565C0" };
    return { bg: "#FFF3E0", color: "#FF6D00" };
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: "#0A1628" }}>Planning Semaine 22</h2>
          <p className="text-xs" style={{ color: "#64748B" }}>26 mai – 1 juin 2026 · 3 salariés</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border hover:bg-gray-50" style={{ color: "#1565C0" }}>⬇ Exporter</button>
          <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "#1565C0" }}>+ Ajouter quart</button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-4" style={{ background: "#F0F4FF" }}>
        <div className="bg-white rounded-xl border shadow-sm overflow-auto">
          <table className="w-full text-xs min-w-max">
            <thead>
              <tr style={{ background: "#0A1628" }}>
                <th className="px-4 py-3 text-left font-semibold text-white w-36">Salarié</th>
                {days.map((d) => (
                  <th key={d} className="px-3 py-3 text-center font-semibold text-white min-w-32">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {employees.map((emp, ei) => (
                <tr key={ei} className="border-t hover:bg-blue-50 transition">
                  <td className="px-4 py-3 font-semibold" style={{ color: "#1F2937" }}>{emp.nom}</td>
                  {emp.shifts.map((shift, di) => {
                    const s = shiftStyle(shift);
                    return (
                      <td key={di} className="px-2 py-3 text-center">
                        <span className="inline-block rounded-lg px-2 py-1 font-medium text-xs" style={{ background: s.bg, color: s.color }}>
                          {shift}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3 mt-3 text-xs">
          {[
            { label: "Matin 06:00–14:00", bg: "#E3F2FD", color: "#1565C0" },
            { label: "Soir 14:00–22:00", bg: "#FFF3E0", color: "#FF6D00" },
            { label: "Repos", bg: "#F1F5F9", color: "#94A3B8" },
          ].map((l) => (
            <span key={l.label} className="flex items-center gap-1.5 px-2 py-1 rounded-lg" style={{ background: l.bg, color: l.color }}>
              <span className="w-2 h-2 rounded-full inline-block" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>
        <p className="text-xs text-center pt-3" style={{ color: "#94A3B8" }}>
          Fonctionnalité disponible — développement complet prévu phase 2
        </p>
      </div>
    </div>
  );
}
