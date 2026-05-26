export default function EtablissementsPanel() {
  const etablissements = [
    { nom: "CHU Grenoble", type: "Hôpital", icon: "🏥", adresse: "Avenue Maquis du Grésivaudan, Grenoble", tel: "04 76 76 75 75", service: "Urgences / Cardiologie" },
    { nom: "Clinique Belledonne", type: "Clinique", icon: "🏨", adresse: "14 Rue de Comboire, Échirolles", tel: "04 76 33 00 33", service: "Chirurgie ambulatoire" },
    { nom: "EHPAD Les Pins", type: "EHPAD", icon: "🏡", adresse: "32 Rue des Pins, Voiron", tel: "04 76 65 12 00", service: "Résidence médicalisée" },
  ];
  const typeColor = { "Hôpital": "#1565C0", "Clinique": "#7C3AED", "EHPAD": "#059669" };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: "#0A1628" }}>Établissements</h2>
          <p className="text-xs" style={{ color: "#64748B" }}>{etablissements.length} établissements référencés</p>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "#1565C0" }}>
          + Ajouter
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#F0F4FF" }}>
        <div className="grid grid-cols-1 gap-3">
          {etablissements.map((e, i) => (
            <div key={i} className="bg-white rounded-xl border shadow-sm p-4 flex gap-4 items-start hover:shadow-md transition">
              <div className="text-3xl">{e.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm" style={{ color: "#1F2937" }}>{e.nom}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ background: typeColor[e.type] }}>{e.type}</span>
                </div>
                <div className="text-xs mb-0.5" style={{ color: "#64748B" }}>📍 {e.adresse}</div>
                <div className="text-xs mb-0.5" style={{ color: "#64748B" }}>📞 {e.tel}</div>
                <div className="text-xs" style={{ color: "#94A3B8" }}>🏷 {e.service}</div>
              </div>
              <button className="text-xs px-3 py-1.5 rounded-lg border hover:bg-gray-50 font-medium" style={{ color: "#1565C0" }}>
                Modifier
              </button>
            </div>
          ))}
        </div>
        <p className="text-xs text-center pt-2" style={{ color: "#94A3B8" }}>
          Fonctionnalité disponible — développement complet prévu phase 2
        </p>
      </div>
    </div>
  );
}
