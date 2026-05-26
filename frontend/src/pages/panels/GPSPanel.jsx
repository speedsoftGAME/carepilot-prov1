export default function GPSPanel() {
  const vehicles = [
    { id: 1, name: "Ambulance 1", crew: "J. Dupont / M. Martin", status: "En mission", lat: "45.1842", lng: "5.7153" },
    { id: 2, name: "Ambulance 2", crew: "P. Bernard", status: "Disponible", lat: "45.1910", lng: "5.7280" },
    { id: 3, name: "VSL 1", crew: "C. Morel", status: "Retour base", lat: "45.1765", lng: "5.7042" },
  ];
  const statusColor = { "En mission": "#FF6D00", "Disponible": "#00C853", "Retour base": "#2196F3" };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: "#0A1628" }}>GPS Temps Réel</h2>
          <p className="text-xs" style={{ color: "#64748B" }}>Localisation flotte — Socket.io étape 10</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700 font-medium">
          ⏳ En attente de connexion GPS...
        </span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#F0F4FF" }}>
        <div className="bg-white rounded-xl border p-4 text-center text-sm" style={{ color: "#64748B" }}>
          <div className="text-4xl mb-2">📡</div>
          <p className="font-medium">Module GPS Socket.io non connecté</p>
          <p className="text-xs mt-1">La carte interactive sera disponible à l'étape 10 du développement.</p>
        </div>
        <p className="text-xs font-semibold uppercase tracking-wide px-1" style={{ color: "#94A3B8" }}>Dernières positions connues</p>
        {vehicles.map(v => (
          <div key={v.id} className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-3 h-3 rounded-full" style={{ background: statusColor[v.status] }} />
              <div className="absolute inset-0 w-3 h-3 rounded-full animate-ping opacity-60" style={{ background: statusColor[v.status] }} />
            </div>
            <div className="flex-1">
              <div className="font-semibold text-sm" style={{ color: "#1F2937" }}>{v.name}</div>
              <div className="text-xs" style={{ color: "#64748B" }}>{v.crew}</div>
              <div className="text-xs mt-1" style={{ color: "#94A3B8" }}>Lat {v.lat} · Lng {v.lng}</div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full font-medium" style={{ background: statusColor[v.status] + "22", color: statusColor[v.status] }}>
              {v.status}
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
