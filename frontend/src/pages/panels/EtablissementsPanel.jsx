import { useState, useEffect } from "react";
import client from "../../api/client";

const TYPE_CONFIG = {
  hopital:  { label: "Hôpital",  icon: "🏥", color: "#1565C0" },
  clinique: { label: "Clinique", icon: "🏨", color: "#7C3AED" },
  ehpad:    { label: "EHPAD",    icon: "🏡", color: "#059669" },
  cabinet:  { label: "Cabinet",  icon: "🩺", color: "#0891B2" },
  autre:    { label: "Autre",    icon: "🏢", color: "#64748B" },
};

const EMPTY = { nom: "", type: "hopital", adresse: "", tel: "", service: "" };

export default function EtablissementsPanel() {
  const [etablissements, setEtablissements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    client.get("/api/etablissements")
      .then(({ data }) => setEtablissements(data))
      .catch(() => setError("Impossible de charger les établissements"))
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setForm(EMPTY); setModal("create"); setError(""); };
  const openEdit = (e) => { setForm({ nom: e.nom, type: e.type, adresse: e.adresse || "", tel: e.tel || "", service: e.service || "" }); setModal(e); setError(""); };

  const save = async () => {
    if (!form.nom.trim()) return setError("Le nom est requis");
    setSaving(true);
    setError("");
    try {
      if (modal === "create") {
        const { data } = await client.post("/api/etablissements", form);
        setEtablissements((prev) => [...prev, data].sort((a, b) => a.nom.localeCompare(b.nom)));
      } else {
        const { data } = await client.put(`/api/etablissements/${modal.id}`, form);
        setEtablissements((prev) => prev.map((e) => (e.id === data.id ? data : e)));
      }
      setModal(null);
    } catch (e) {
      setError(e.response?.data?.error || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Supprimer cet établissement ?")) return;
    try {
      await client.delete(`/api/etablissements/${id}`);
      setEtablissements((prev) => prev.filter((e) => e.id !== id));
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: "#0A1628" }}>Établissements</h2>
          <p className="text-xs" style={{ color: "#64748B" }}>{etablissements.length} établissement{etablissements.length !== 1 ? "s" : ""} référencé{etablissements.length !== 1 ? "s" : ""}</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "#1565C0" }}>
          + Ajouter
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#F0F4FF" }}>
        {loading ? (
          <div className="text-center py-8 text-sm" style={{ color: "#94A3B8" }}>Chargement...</div>
        ) : etablissements.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: "#94A3B8" }}>Aucun établissement enregistré</div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {etablissements.map((e) => {
              const tc = TYPE_CONFIG[e.type] || TYPE_CONFIG.autre;
              return (
                <div key={e.id} className="bg-white rounded-xl border shadow-sm p-4 flex gap-4 items-start hover:shadow-md transition">
                  <div className="text-3xl">{tc.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm" style={{ color: "#1F2937" }}>{e.nom}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium text-white" style={{ background: tc.color }}>{tc.label}</span>
                    </div>
                    {e.adresse && <div className="text-xs mb-0.5" style={{ color: "#64748B" }}>📍 {e.adresse}</div>}
                    {e.tel && <div className="text-xs mb-0.5" style={{ color: "#64748B" }}>📞 {e.tel}</div>}
                    {e.service && <div className="text-xs" style={{ color: "#94A3B8" }}>🏷 {e.service}</div>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(e)} className="text-xs px-2 py-1 rounded-lg border hover:bg-gray-50 font-medium" style={{ color: "#1565C0" }}>Modifier</button>
                    <button onClick={() => remove(e.id)} className="text-xs px-2 py-1 rounded-lg border hover:bg-red-50" style={{ color: "#F44336" }}>✕</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ background: "#0A1628" }}>
              <h3 className="font-bold text-white">{modal === "create" ? "Nouvel établissement" : "Modifier l'établissement"}</h3>
              <button onClick={() => setModal(null)} className="text-white opacity-60 hover:opacity-100 text-xl">✕</button>
            </div>
            <div className="p-5 space-y-3">
              {error && <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#64748B" }}>Nom *</label>
                <input value={form.nom} onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#64748B" }}>Type</label>
                <select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2">
                  {Object.entries(TYPE_CONFIG).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              {[
                { label: "Adresse", name: "adresse" },
                { label: "Téléphone", name: "tel" },
                { label: "Service / spécialité", name: "service" },
              ].map(({ label, name }) => (
                <div key={name}>
                  <label className="block text-xs font-semibold mb-1" style={{ color: "#64748B" }}>{label}</label>
                  <input value={form[name]} onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2" />
                </div>
              ))}
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
