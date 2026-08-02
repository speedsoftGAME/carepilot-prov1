import { useState, useEffect } from "react";
import client from "../../api/client";
import useStore from "../../store/useStore";

const STYLE = {
  warning: { bg: "#FFF8E1", border: "#FFD54F", color: "#FF6D00", icon: "⚠", label: "Attention" },
  info:    { bg: "#E3F2FD", border: "#90CAF9", color: "#1565C0", icon: "ℹ", label: "Info" },
  error:   { bg: "#FFEBEE", border: "#EF9A9A", color: "#F44336", icon: "✕", label: "Erreur" },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "À l'instant";
  if (m < 60) return `Il y a ${m} min`;
  const h = Math.floor(m / 60);
  if (h < 24) return `Il y a ${h}h`;
  return `Il y a ${Math.floor(h / 24)}j`;
}

export default function AlertesPanel() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const toasts = useStore((s) => s.toasts);

  const load = async () => {
    try {
      const { data } = await client.get("/api/alerts");
      setAlerts(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Reload when new toast arrives (means new Socket.io notification)
  useEffect(() => {
    if (toasts.length > 0) load();
  }, [toasts.length]);

  const markRead = async (id) => {
    try {
      const { data } = await client.patch(`/api/alerts/${id}/read`);
      setAlerts((prev) => prev.map((a) => (a.id === id ? data : a)));
    } catch { /* silent */ }
  };

  const markAllRead = async () => {
    try {
      await client.post("/api/alerts/read-all");
      setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
    } catch { /* silent */ }
  };

  const remove = async (id) => {
    try {
      await client.delete(`/api/alerts/${id}`);
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch { /* silent */ }
  };

  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="font-semibold text-base" style={{ color: "#0A1628" }}>Alertes Système</h2>
            <p className="text-xs" style={{ color: "#64748B" }}>{alerts.length} alerte{alerts.length !== 1 ? "s" : ""} · {unread} non lue{unread !== 1 ? "s" : ""}</p>
          </div>
          {unread > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-full font-bold text-white" style={{ background: "#F44336" }}>{unread}</span>
          )}
        </div>
        <button onClick={markAllRead} className="px-3 py-1.5 rounded-lg text-xs font-semibold border hover:bg-gray-50" style={{ color: "#1565C0" }}>
          Tout marquer lu
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#F0F4FF" }}>
        {loading ? (
          <div className="text-center py-8 text-sm" style={{ color: "#94A3B8" }}>Chargement...</div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: "#94A3B8" }}>Aucune alerte</div>
        ) : (
          alerts.map((alert) => {
            const s = STYLE[alert.type] || STYLE.info;
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
                    <span className="font-semibold text-sm" style={{ color: "#1F2937" }}>{alert.title}</span>
                    {!alert.read && <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />}
                  </div>
                  {alert.message && <p className="text-xs" style={{ color: "#64748B" }}>{alert.message}</p>}
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className="text-xs" style={{ color: "#94A3B8" }}>{timeAgo(alert.createdAt)}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded font-medium" style={{ background: s.color + "22", color: s.color }}>{s.label}</span>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {!alert.read && (
                    <button onClick={() => markRead(alert.id)} className="text-xs px-2 py-1 rounded-lg border hover:bg-white transition" style={{ color: "#64748B" }}>Lu</button>
                  )}
                  <button onClick={() => remove(alert.id)} className="text-xs px-2 py-1 rounded-lg border hover:bg-red-50 transition" style={{ color: "#F44336" }}>✕</button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
