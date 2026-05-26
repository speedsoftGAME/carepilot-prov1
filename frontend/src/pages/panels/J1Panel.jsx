export default function J1Panel() {
  const tomorrow = "Mercredi 27 mai 2026";
  const missions = [
    {
      num: "M-2026-014",
      patient: "Gérard Fontaine",
      heure: "06:30",
      trajet: "Voiron → CHU Grenoble",
      type: "AMB",
      vehicule: "Ambulance 1",
      priorite: "Urgent",
    },
    {
      num: "M-2026-015",
      patient: "Colette Renaud",
      heure: "09:00",
      trajet: "EHPAD Les Pins → Clinique Belledonne",
      type: "VSL",
      vehicule: "VSL 1",
      priorite: "Normal",
    },
    {
      num: "M-2026-016",
      patient: "Michel Garnier",
      heure: "14:15",
      trajet: "CHU Grenoble → Domicile",
      type: "AMB",
      vehicule: "Ambulance 2",
      priorite: "Normal",
    },
  ];

  const prioStyle = (p) =>
    p === "Urgent"
      ? { bg: "#FFEBEE", color: "#F44336" }
      : { bg: "#E3F2FD", color: "#1565C0" };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: "#0A1628" }}>Planning J+1</h2>
          <p className="text-xs" style={{ color: "#64748B" }}>{tomorrow}</p>
        </div>
        <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "#1565C0" }}>
          + Planifier une mission
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#F0F4FF" }}>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Missions planifiées", value: "3", color: "#1565C0" },
            { label: "Véhicules mobilisés", value: "3", color: "#FF6D00" },
            { label: "Urgences", value: "1", color: "#F44336" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border shadow-sm p-3 text-center">
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>{s.label}</div>
            </div>
          ))}
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide px-1" style={{ color: "#94A3B8" }}>
          Missions du {tomorrow}
        </p>
        {missions.map((m) => (
          <div key={m.num} className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4">
            <div className="text-center flex-shrink-0 w-12">
              <div className="text-sm font-bold" style={{ color: "#1565C0" }}>{m.heure}</div>
              <div className="text-xs mt-0.5 px-1.5 py-0.5 rounded font-semibold text-white" style={{ background: "#0A1628" }}>{m.type}</div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm" style={{ color: "#1F2937" }}>{m.patient}</div>
              <div className="text-xs" style={{ color: "#64748B" }}>{m.trajet}</div>
              <div className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>🚑 {m.vehicule}</div>
            </div>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
              style={{ background: prioStyle(m.priorite).bg, color: prioStyle(m.priorite).color }}>
              {m.priorite}
            </span>
          </div>
        ))}
        <p className="text-xs text-center pt-2" style={{ color: "#94A3B8" }}>
          Fonctionnalité disponible — développement complet prévu phase 2
        </p>
      </div>
    </div>
  );
}
