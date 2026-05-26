export default function ElisaPanel() {
  const messages = [
    { id: 1, from: "SAMU 38", to: "Ambulance 1", time: "08:14", text: "Patient en attente route de Grenoble — urgence relative", type: "in" },
    { id: 2, from: "Ambulance 1", to: "SAMU 38", time: "08:16", text: "Prise en charge confirmée — ETA 12 min", type: "out" },
    { id: 3, from: "SAMU 38", to: "Régulation", time: "08:31", text: "Nouvelle demande VSL — CHU Grenoble vers Voiron", type: "in" },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: "#0A1628" }}>Interface Élisa — SAMU 38</h2>
          <p className="text-xs" style={{ color: "#64748B" }}>Communication SAMU ↔ Régulation ambulancière</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-600 font-medium">● Déconnecté</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#F0F4FF" }}>
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-4 py-2 border-b text-xs font-semibold" style={{ background: "#0A1628", color: "#fff" }}>
            📻 Régulation SAMU 38 — Journal des communications
          </div>
          <div className="p-3 space-y-2">
            {messages.map(m => (
              <div key={m.id} className={`flex ${m.type === "out" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs rounded-xl px-3 py-2 text-xs shadow-sm ${m.type === "out" ? "text-white" : "bg-gray-100 text-gray-700"}`}
                  style={m.type === "out" ? { background: "#1565C0" } : {}}>
                  <div className="font-semibold mb-0.5">{m.from} → {m.to} · {m.time}</div>
                  <div>{m.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border shadow-sm p-3">
          <label className="text-xs font-semibold block mb-2" style={{ color: "#64748B" }}>Envoyer un message Élisa</label>
          <textarea
            disabled
            placeholder="Connexion Élisa requise pour envoyer des messages..."
            rows={2}
            className="w-full border rounded-lg px-3 py-2 text-xs resize-none bg-gray-50 text-gray-400 cursor-not-allowed"
          />
          <button disabled className="mt-2 px-4 py-1.5 rounded-lg text-xs font-medium text-white cursor-not-allowed opacity-50"
            style={{ background: "#1565C0" }}>
            Envoyer
          </button>
        </div>
        <p className="text-xs text-center pt-2" style={{ color: "#94A3B8" }}>
          Fonctionnalité disponible — développement complet prévu phase 2
        </p>
      </div>
    </div>
  );
}
