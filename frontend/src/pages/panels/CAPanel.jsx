export default function CAPanel() {
  const stats = [
    { label: "CA du jour", value: "842 €", icon: "📅", color: "#1565C0" },
    { label: "CA du mois", value: "18 640 €", icon: "📆", color: "#00C853" },
    { label: "Missions du mois", value: "312", icon: "🚑", color: "#FF6D00" },
  ];
  const days = [
    { day: "Lun", ca: 720 }, { day: "Mar", ca: 1050 }, { day: "Mer", ca: 890 },
    { day: "Jeu", ca: 640 }, { day: "Ven", ca: 1200 }, { day: "Sam", ca: 580 }, { day: "Dim", ca: 420 },
  ];
  const max = Math.max(...days.map(d => d.ca));

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: "#0A1628" }}>Chiffre d'Affaires</h2>
          <p className="text-xs" style={{ color: "#64748B" }}>Synthèse financière — Mai 2026</p>
        </div>
        <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border hover:bg-gray-50" style={{ color: "#1565C0" }}>Exporter</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: "#F0F4FF" }}>
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s, i) => (
            <div key={i} className="bg-white rounded-xl border shadow-sm p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-4">
          <p className="text-xs font-semibold mb-4" style={{ color: "#64748B" }}>CA des 7 derniers jours (€)</p>
          <div className="flex items-end gap-2 h-32">
            {days.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-semibold" style={{ color: "#1565C0" }}>{d.ca}</span>
                <div className="w-full rounded-t-lg transition-all" style={{ height: `${(d.ca / max) * 100}px`, background: i === 0 ? "#2196F3" : "#1565C0" }} />
                <span className="text-xs" style={{ color: "#94A3B8" }}>{d.day}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-center pt-1" style={{ color: "#94A3B8" }}>
          Fonctionnalité disponible — développement complet prévu phase 2
        </p>
      </div>
    </div>
  );
}
