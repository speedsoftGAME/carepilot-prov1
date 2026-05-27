import { useState, useEffect } from "react";
import client from "../../api/client";

const DAYS_FR = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
const MONTHS_FR = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

function formatDateFr(d) {
  return `${DAYS_FR[d.getDay()]} ${d.getDate()} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`;
}

function toISO(d) {
  return d.toISOString().slice(0, 10);
}

function getTomorrow() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d;
}

const PRIORITY_STYLE = {
  urgent: { bg: "#FFEBEE", color: "#F44336" },
  normal: { bg: "#E3F2FD", color: "#1565C0" },
};

export default function J1Panel() {
  const [date, setDate] = useState(getTomorrow());
  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    client.get("/api/missions", { params: { date: toISO(date) } })
      .then(({ data }) => setMissions(data))
      .catch(() => setMissions([]))
      .finally(() => setLoading(false));
  }, [date]);

  const prev = () => setDate((d) => { const n = new Date(d); n.setDate(n.getDate() - 1); return n; });
  const next = () => setDate((d) => { const n = new Date(d); n.setDate(n.getDate() + 1); return n; });
  const today = () => setDate(getTomorrow());

  const total = missions.length;
  const urgent = missions.filter((m) => m.priority === "urgent").length;
  const unassigned = missions.filter((m) => !m.vehicleId).length;
  const vehicles = new Set(missions.map((m) => m.vehicleId).filter(Boolean)).size;

  const sorted = [...missions].sort((a, b) => (a.time || "").localeCompare(b.time || ""));

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: "#0A1628" }}>Planning J+1</h2>
          <p className="text-xs" style={{ color: "#64748B" }}>{formatDateFr(date)}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="px-2 py-1 rounded-lg border text-sm hover:bg-gray-50">‹</button>
          <button onClick={today} className="px-3 py-1.5 rounded-lg border text-xs font-medium hover:bg-gray-50" style={{ color: "#1565C0" }}>Demain</button>
          <button onClick={next} className="px-2 py-1 rounded-lg border text-sm hover:bg-gray-50">›</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#F0F4FF" }}>
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Missions", value: total, color: "#1565C0" },
            { label: "Véhicules", value: vehicles, color: "#FF6D00" },
            { label: "Urgences", value: urgent, color: "#F44336" },
            { label: "Non assignées", value: unassigned, color: "#94A3B8" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border shadow-sm p-3 text-center">
              <div className="text-2xl font-bold" style={{ color: s.color }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: "#64748B" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <p className="text-xs font-semibold uppercase tracking-wide px-1" style={{ color: "#94A3B8" }}>
          Missions du {formatDateFr(date)}
        </p>

        {loading ? (
          <div className="text-center py-8 text-sm" style={{ color: "#94A3B8" }}>Chargement...</div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: "#94A3B8" }}>Aucune mission planifiée pour ce jour</div>
        ) : (
          sorted.map((m) => {
            const ps = PRIORITY_STYLE[m.priority] || PRIORITY_STYLE.normal;
            return (
              <div key={m.id} className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4">
                <div className="text-center flex-shrink-0 w-14">
                  <div className="text-sm font-bold" style={{ color: "#1565C0" }}>{m.time || "—"}</div>
                  <div className="text-xs mt-0.5 px-1.5 py-0.5 rounded font-semibold text-white inline-block" style={{ background: "#0A1628" }}>{m.type}</div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: "#1F2937" }}>{m.patient}</div>
                  <div className="text-xs" style={{ color: "#64748B" }}>{m.from} → {m.to}</div>
                  <div className="text-xs mt-0.5" style={{ color: "#94A3B8" }}>
                    🚑 {m.vehicle ? m.vehicle.name : <span style={{ color: "#F44336" }}>Non assignée</span>}
                  </div>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0"
                  style={{ background: ps.bg, color: ps.color }}>
                  {m.priority === "urgent" ? "Urgent" : "Normal"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
