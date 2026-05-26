import { useState } from "react";

export default function ImperatifsPanel() {
  const [items, setItems] = useState([
    { id: 1, desc: "Contrôle technique — Ambulance 1", delai: 5, priorite: "urgent", categorie: "Véhicule" },
    { id: 2, desc: "Renouvellement assurance — VSL 1", delai: 12, priorite: "warning", categorie: "Administratif" },
    { id: 3, desc: "Formation DEA — Jean Dupont", delai: 30, priorite: "info", categorie: "RH" },
    { id: 4, desc: "Nettoyage désinfection — Ambulance 2", delai: 2, priorite: "urgent", categorie: "Hygiène" },
    { id: 5, desc: "Renouvellement trousse secours — AMB-01", delai: 18, priorite: "warning", categorie: "Équipement" },
  ]);

  const prio = {
    urgent: { bg: "#FFEBEE", color: "#F44336", dot: "#F44336", label: "Urgent" },
    warning: { bg: "#FFF8E1", color: "#FF6D00", dot: "#FF6D00", label: "Attention" },
    info: { bg: "#E3F2FD", color: "#1565C0", dot: "#2196F3", label: "Info" },
  };

  const sorted = [...items].sort((a, b) => a.delai - b.delai);

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: "#0A1628" }}>Impératifs & Rappels</h2>
          <p className="text-xs" style={{ color: "#64748B" }}>{items.length} échéances à surveiller</p>
        </div>
        <button className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "#1565C0" }}>
          + Ajouter
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#F0F4FF" }}>
        {sorted.map((item) => {
          const p = prio[item.priorite];
          return (
            <div key={item.id} className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: p.dot }} />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm" style={{ color: "#1F2937" }}>{item.desc}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: "#F0F4FF", color: "#64748B" }}>
                    {item.categorie}
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="text-sm font-bold" style={{ color: p.color }}>
                  {item.delai === 1 ? "Demain" : `dans ${item.delai} jours`}
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: p.bg, color: p.color }}>
                  {p.label}
                </span>
              </div>
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
