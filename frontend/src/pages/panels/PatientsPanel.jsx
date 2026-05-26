import { useState } from "react";

export default function PatientsPanel() {
  const [search, setSearch] = useState("");
  const patients = [
    { nom: "Dubois", prenom: "Robert", nss: "1 52 04 69•••", mutuelle: "MGEN", medecin: "Dr. Favre" },
    { nom: "Lefèvre", prenom: "Sophie", nss: "2 78 11 38•••", mutuelle: "Harmonie", medecin: "Dr. Blanc" },
    { nom: "Moreau", prenom: "Henri", nss: "1 45 06 75•••", mutuelle: "Malakoff", medecin: "Dr. Arnaud" },
  ];
  const filtered = patients.filter(p =>
    `${p.nom} ${p.prenom}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: "#0A1628" }}>Dossiers Patients</h2>
          <p className="text-xs" style={{ color: "#64748B" }}>{patients.length} patients enregistrés</p>
        </div>
        <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "#1565C0" }}>
          + Nouveau patient
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#F0F4FF" }}>
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Rechercher par nom ou prénom..."
          className="w-full bg-white border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2"
          style={{ "--tw-ring-color": "#1565C0" }}
        />
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ background: "#F0F4FF" }}>
                {["Nom", "Prénom", "NSS", "Mutuelle", "Médecin", ""].map(h => (
                  <th key={h} className="px-4 py-2 text-xs font-semibold" style={{ color: "#64748B" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={i} className="border-b last:border-0 hover:bg-blue-50 transition">
                  <td className="px-4 py-3 font-semibold" style={{ color: "#1F2937" }}>{p.nom}</td>
                  <td className="px-4 py-3" style={{ color: "#1F2937" }}>{p.prenom}</td>
                  <td className="px-4 py-3 font-mono text-xs" style={{ color: "#64748B" }}>{p.nss}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#64748B" }}>{p.mutuelle}</td>
                  <td className="px-4 py-3 text-xs" style={{ color: "#64748B" }}>{p.medecin}</td>
                  <td className="px-4 py-3">
                    <button className="text-xs px-2 py-1 rounded-lg border hover:bg-gray-50" style={{ color: "#1565C0" }}>Voir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-center pt-2" style={{ color: "#94A3B8" }}>
          Fonctionnalité disponible — développement complet prévu phase 2
        </p>
      </div>
    </div>
  );
}
