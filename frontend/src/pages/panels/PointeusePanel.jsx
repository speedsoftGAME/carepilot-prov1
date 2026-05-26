import { useState } from "react";

export default function PointeusePanel() {
  const [pin, setPin] = useState("");
  const recent = [
    { name: "Jean Dupont", type: "Entrée", time: "07:45", color: "#00C853" },
    { name: "Marie Martin", type: "Entrée", time: "07:52", color: "#00C853" },
    { name: "Paul Bernard", type: "Sortie", time: "16:05", color: "#F44336" },
  ];

  const press = (v) => setPin(p => p.length < 6 ? p + v : p);
  const clear = () => setPin("");

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: "#0A1628" }}>Pointeuse Salariés</h2>
          <p className="text-xs" style={{ color: "#64748B" }}>Saisie PIN pour entrée / sortie</p>
        </div>
        <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-medium">● Actif</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4" style={{ background: "#F0F4FF" }}>
        <div className="bg-white rounded-xl border shadow-sm p-5 max-w-xs mx-auto">
          <p className="text-center text-sm font-medium mb-3" style={{ color: "#64748B" }}>Entrez votre code PIN</p>
          <div className="flex justify-center gap-2 mb-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 flex items-center justify-center text-lg"
                style={{ borderColor: "#1565C0", background: i < pin.length ? "#1565C0" : "transparent" }}>
                {i < pin.length && <span style={{ color: "#fff" }}>●</span>}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k, i) => (
              <button key={i} onClick={() => k === "⌫" ? setPin(p => p.slice(0,-1)) : k !== "" && press(String(k))}
                className="h-10 rounded-lg font-semibold text-sm border transition hover:bg-gray-50 active:scale-95"
                style={{ color: "#1F2937", visibility: k === "" ? "hidden" : "visible" }}>
                {k}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={clear} className="py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "#F44336" }}>Sortie</button>
            <button onClick={clear} className="py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "#00C853" }}>Entrée</button>
          </div>
        </div>
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-4 py-2 border-b text-xs font-semibold" style={{ color: "#64748B" }}>Activité récente aujourd'hui</div>
          {recent.map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 border-b last:border-0">
              <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
              <div className="flex-1 text-sm font-medium" style={{ color: "#1F2937" }}>{r.name}</div>
              <span className="text-xs font-semibold" style={{ color: r.color }}>{r.type}</span>
              <span className="text-xs" style={{ color: "#94A3B8" }}>{r.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
