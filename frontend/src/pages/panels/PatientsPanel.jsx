import { useState, useEffect, useCallback } from "react";
import client from "../../api/client";

const EMPTY = { nom: "", prenom: "", nss: "", mutuelle: "", ddn: "", tel: "", adresse: "", medecin: "", obs: "", poids: "" };

export default function PatientsPanel() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // null | "create" | patient object
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (q) => {
    setLoading(true);
    try {
      const { data } = await client.get("/api/patients", { params: q ? { search: q } : {} });
      setPatients(data);
    } catch {
      setError("Impossible de charger les patients");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(search), search ? 300 : 0);
    return () => clearTimeout(t);
  }, [search, load]);

  const openCreate = () => { setForm(EMPTY); setModal("create"); setError(""); };
  const openEdit = (p) => { setForm({ ...p, poids: p.poids ?? "" }); setModal(p); setError(""); };

  const save = async () => {
    if (!form.nom.trim()) return setError("Le nom est requis");
    setSaving(true);
    setError("");
    try {
      const payload = { ...form, poids: form.poids ? parseFloat(form.poids) : null };
      if (modal === "create") {
        const { data } = await client.post("/api/patients", payload);
        setPatients((prev) => [data, ...prev]);
      } else {
        const { data } = await client.put(`/api/patients/${modal.id}`, payload);
        setPatients((prev) => prev.map((p) => (p.id === data.id ? data : p)));
      }
      setModal(null);
    } catch (e) {
      setError(e.response?.data?.error || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Supprimer ce patient ?")) return;
    try {
      await client.delete(`/api/patients/${id}`);
      setPatients((prev) => prev.filter((p) => p.id !== id));
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  const Field = ({ label, name, type = "text", half }) => (
    <div className={half ? "col-span-1" : "col-span-2"}>
      <label className="block text-xs font-semibold mb-1" style={{ color: "#64748B" }}>{label}</label>
      <input
        type={type}
        value={form[name]}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
        style={{ "--tw-ring-color": "#1565C0" }}
      />
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: "#0A1628" }}>Dossiers Patients</h2>
          <p className="text-xs" style={{ color: "#64748B" }}>{patients.length} patient{patients.length !== 1 ? "s" : ""} enregistré{patients.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "#1565C0" }}>
          + Nouveau patient
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#F0F4FF" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Rechercher par nom, prénom ou NSS..."
          className="w-full bg-white border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2"
        />

        {loading ? (
          <div className="text-center py-8 text-sm" style={{ color: "#94A3B8" }}>Chargement...</div>
        ) : patients.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: "#94A3B8" }}>Aucun patient trouvé</div>
        ) : (
          <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left" style={{ background: "#F0F4FF" }}>
                  {["Nom", "Prénom", "NSS", "Mutuelle", "Médecin", ""].map((h) => (
                    <th key={h} className="px-4 py-2 text-xs font-semibold" style={{ color: "#64748B" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-blue-50 transition">
                    <td className="px-4 py-3 font-semibold" style={{ color: "#1F2937" }}>{p.nom}</td>
                    <td className="px-4 py-3" style={{ color: "#1F2937" }}>{p.prenom}</td>
                    <td className="px-4 py-3 font-mono text-xs" style={{ color: "#64748B" }}>{p.nss || "—"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#64748B" }}>{p.mutuelle || "—"}</td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#64748B" }}>{p.medecin || "—"}</td>
                    <td className="px-4 py-3 flex gap-1">
                      <button onClick={() => openEdit(p)} className="text-xs px-2 py-1 rounded-lg border hover:bg-gray-50" style={{ color: "#1565C0" }}>Modifier</button>
                      <button onClick={() => remove(p.id)} className="text-xs px-2 py-1 rounded-lg border hover:bg-red-50" style={{ color: "#F44336" }}>✕</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ background: "#0A1628" }}>
              <h3 className="font-bold text-white">{modal === "create" ? "Nouveau patient" : "Modifier le patient"}</h3>
              <button onClick={() => setModal(null)} className="text-white opacity-60 hover:opacity-100 text-xl">✕</button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-3 max-h-[70vh] overflow-y-auto">
              {error && <div className="col-span-2 text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
              <Field label="Nom *" name="nom" />
              <Field label="Prénom" name="prenom" half />
              <Field label="Date de naissance" name="ddn" type="date" half />
              <Field label="NSS (N° sécu)" name="nss" />
              <Field label="Mutuelle" name="mutuelle" half />
              <Field label="Téléphone" name="tel" half />
              <Field label="Adresse" name="adresse" />
              <Field label="Médecin traitant" name="medecin" half />
              <Field label="Poids (kg)" name="poids" type="number" half />
              <div className="col-span-2">
                <label className="block text-xs font-semibold mb-1" style={{ color: "#64748B" }}>Observations</label>
                <textarea
                  value={form.obs}
                  onChange={(e) => setForm((f) => ({ ...f, obs: e.target.value }))}
                  rows={2}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 resize-none"
                />
              </div>
            </div>
            <div className="px-5 py-3 border-t flex justify-end gap-2">
              <button onClick={() => setModal(null)} className="px-4 py-2 rounded-lg border text-sm font-medium" style={{ color: "#64748B" }}>Annuler</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 rounded-lg text-sm font-semibold text-white" style={{ background: "#1565C0" }}>
                {saving ? "Sauvegarde..." : "Enregistrer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
