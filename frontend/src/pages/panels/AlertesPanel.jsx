import { useState } from "react";

export default function AlertesPanel() {
  const [alerts, setAlerts] = useState([
    { id: 1, type: "warning", titre: "Ambulance 2 — Vidange huile recommandée", detail: "Kilométrage dépassé de 500 km. Intervention recommandée sous 5 jours.", time: "Il y a 2h", read: false },
    { id: 2, type: "warning", titre: "Mission M-2026-002 — Retard signalé", detail: "Retard estimé de 18 minutes sur la prise en charge prévue à 09:00.", time: "Il y a 45 min", read: false },
    { id: 3, type: "info", titre: "Système — Sauvegarde BDD effectuée", detail: "Sauvegarde automatique quotidienne réalisée avec succès à 03:00.", time: "Il y a 6h", read: false },
    { id: 4, type: "error", titre: "GPS Ambulance 1 — Signal perdu", detail: "La balise GPS de l'Ambulance 1 n'a pas émis depuis 22 minutes.", time: "Il y a 22 min", read: false },
    { id: 5, type: "info", titre: "Nouveau patient enregistré — Henri Moreau", detail: "Dossier patient créé par Marie Martin.", time: "Il y a 1h30", read: true },
  ]);

  const style = {
    warning: { bg: "#FFF8E1", border: "#FFD54F", color: "#FF6D00", icon: "⚠", label: "Attention" },
    info:    { bg: "#E3F2FD", border: "#90CAF9", color: "#1565C0", icon: "ℹ", label: "Info" },
    error:   { bg: "#FFEBEE", border: "#EF9A9A", color: "#F44336", icon: "✕", label: "Erreur" },
  };

  const markRead = (id) => setAlerts((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a));
  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-semibold text-base" style={{ color: "#0A1628" }}>Alertes Système</h2>
            <p className="text-xs" style={{ color: "#64748B" }}>{alerts.length} alertes · {unread} non lues</p>
          </div>
          {unread > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background: "#F44336" }}>{unread}</span>
          )}
        </div>
        <button
          onClick={() => setAlerts((prev) => prev.map((a) => ({ ...a, read: true })))}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold border hover:bg-gray-50"
          style={{ color: "#1565C0" }}
        >
          Tout marquer lu
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#F0F4FF" }}>
        {alerts.map((alert) => {
          const s = style[alert.type];
          return (
            <div
              key={alert.id}
              className="rounded-xl border shadow-sm p-4 flex gap-3 transition"
              style={{ background: alert.read ? "#fff" : s.bg, borderColor: alert.read ? "#E2E8F0" : s.border, opacity: alert.read ? 0.7 : 1 }}
            >
              <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold"
                style={{ background: s.color + "22", color: s.color }}>
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-semibold text-sm" style={{ color: "#1F2937" }}>{alert.titre}</span>
                  {!alert.read && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />}
                </div>
                <p className="text-xs" style={{ color: "#64748B" }}>{alert.detail}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs" style={{ color: "#94A3B8" }}>{alert.time}</span>
                  <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: s.color + "22", color: s.color }}>{s.label}</span>
                </div>
              </div>
              {!alert.read && (
                <button onClick={() => markRead(alert.id)}
                  className="flex-shrink-0 text-xs px-2 py-1 rounded-lg border hover:bg-white transition"
                  style={{ color: "#64748B" }}>
                  Lu
                </button>
              )}
            </div>
          );
        })}
        <p className="text-xs text-center pt-2" style={{ color: "#94A3B8" }}>
          Fonctionnalité disponible — développement complet prévu phase 2
        </p>
      </div>
    </div>
  );
}
