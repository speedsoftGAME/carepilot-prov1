import { useState, useEffect } from "react";
import client from "../../api/client";

function urgency(days) {
  if (days <= 5)  return { bg: "#FFEBEE", color: "#F44336", dot: "#F44336", label: "Urgent" };
  if (days <= 15) return { bg: "#FFF8E1", color: "#FF6D00", dot: "#FF6D00", label: "Attention" };
  return         { bg: "#E3F2FD", color: "#1565C0", dot: "#2196F3", label: "OK" };
}

export default function ImperatifsPanel() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ desc: "", remind: 30 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    client.get("/api/imperatifs")
      .then(({ data }) => setItems(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setForm({ desc: "", remind: 30 }); setEditing(null); setModal(true); setError(""); };
  const openEdit = (item) => { setForm({ desc: item.desc, remind: item.remind }); setEditing(item); setModal(true); setError(""); };

  const save = async () => {
    if (!form.desc.trim()) return setError("La description est requise");
    setSaving(true);
    setError("");
    try {
      if (!editing) {
        const { data } = await client.post("/api/imperatifs", form);
        setItems((prev) => [...prev, data].sort((a, b) => a.remind - b.remind));
      } else {
        const { data } = await client.put(`/api/imperatifs/${editing.id}`, form);
        setItems((prev) => prev.map((i) => (i.id === data.id ? data : i)).sort((a, b) => a.remind - b.remind));
      }
      setModal(false);
    } catch (e) {
      setError(e.response?.data?.error || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Supprimer cet impératif ?")) return;
    try {
      await client.delete(`/api/imperatifs/${id}`);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      alert("Erreur lors de la suppression");
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-base" style={{ color: "#0A1628" }}>Impératifs & Rappels</h2>
          <p className="text-xs" style={{ color: "#64748B" }}>{items.length} échéance{items.length !== 1 ? "s" : ""} à surveiller</p>
        </div>
        <button onClick={openCreate} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: "#1565C0" }}>
          + Ajouter
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: "#F0F4FF" }}>
        {loading ? (
          <div className="text-center py-8 text-sm" style={{ color: "#94A3B8" }}>Chargement...</div>
        ) : items.length === 0 ? (
          <div className="text-center py-8 text-sm" style={{ color: "#94A3B8" }}>Aucun impératif enregistré</div>
        ) : (
          items.map((item) => {
            const u = urgency(item.remind);
            return (
              <div key={item.id} className="bg-white rounded-xl border shadow-sm p-4 flex items-center gap-4">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: u.dot }} />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm" style={{ color: "#1F2937" }}>{item.desc}</div>
                </div>
                <div className="text-right flex-shrink-0 mr-2">
                  <div className="text-sm font-bold" style={{ color: u.color }}>
                    {item.remind === 1 ? "Demain" : `dans ${item.remind} j`}
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: u.bg, color: u.color }}>
                    {u.label}
                  </span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(item)} className="text-xs px-2 py-1 rounded-lg border hover:bg-gray-50" style={{ color: "#1565C0" }}>✎</button>
                  <button onClick={() => remove(item.id)} className="text-xs px-2 py-1 rounded-lg border hover:bg-red-50" style={{ color: "#F44336" }}>✕</button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.4)" }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center justify-between" style={{ background: "#0A1628" }}>
              <h3 className="font-bold text-white">{editing ? "Modifier l'impératif" : "Nouvel impératif"}</h3>
              <button onClick={() => setModal(false)} className="text-white opacity-60 hover:opacity-100 text-xl">✕</button>
            </div>
            <div className="p-5 space-y-3">
              {error && <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#64748B" }}>Description *</label>
                <input
                  value={form.desc}
                  onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))}
                  placeholder="Ex: Contrôle technique AMB-01"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1" style={{ color: "#64748B" }}>Rappel dans (jours)</label>
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={form.remind}
                  onChange={(e) => setForm((f) => ({ ...f, remind: parseInt(e.target.value) || 30 }))}
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2"
                />
                <p className="text-xs mt-1" style={{ color: urgency(form.remind).color }}>
                  → {urgency(form.remind).label}
                </p>
              </div>
            </div>
            <div className="px-5 py-3 border-t flex justify-end gap-2">
              <button onClick={() => setModal(false)} className="px-4 py-2 rounded-lg border text-sm font-medium" style={{ color: "#64748B" }}>Annuler</button>
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
