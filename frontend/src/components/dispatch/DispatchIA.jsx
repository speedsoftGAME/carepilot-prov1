import { useState } from 'react'
import Modal from '../shared/Modal.jsx'
import { suggestVehicle } from '../../api/dispatch.js'
import useStore from '../../store/useStore.js'

export default function DispatchIA({ open, onClose, mission, onAssign }) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const { addToast } = useStore()

  const analyse = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await suggestVehicle(
        mission?.id
          ? { missionId: mission.id }
          : { from: mission?.from, to: mission?.to, type: mission?.type, priority: mission?.priority }
      )
      setResult(data)
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de l\'analyse')
    } finally {
      setLoading(false)
    }
  }

  const handleAssign = async (vehicleId) => {
    await onAssign(vehicleId)
    addToast('Véhicule assigné par le Dispatch IA', 'success')
    onClose()
  }

  const STATUS_COLOR = {
    available: 'text-green-600',
    on_mission: 'text-orange-500',
    maintenance: 'text-slate-400',
  }

  return (
    <Modal open={open} onClose={onClose} title="🤖 Dispatch IA" size="md">
      {mission && (
        <div className="bg-blue-50 rounded-lg p-3 mb-4 text-sm">
          <div className="font-medium text-blue-800">{mission.patient}</div>
          <div className="text-blue-600 text-xs mt-1">{mission.from} → {mission.to}</div>
          <div className="text-blue-500 text-xs">{mission.type} · {mission.priority === 'urgent' ? '🔴 Urgent' : 'Normal'}</div>
        </div>
      )}

      {!result && !loading && (
        <div className="text-center py-6">
          <div className="text-4xl mb-3">🤖</div>
          <p className="text-slate-600 text-sm mb-4">
            L'IA analyse la position GPS de chaque véhicule et la distance au patient pour te suggérer le meilleur choix.
          </p>
          <button onClick={analyse}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 text-sm">
            Analyser la flotte
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-8">
          <div className="text-2xl mb-3 animate-pulse">🔍</div>
          <p className="text-slate-500 text-sm">Géocodage + calcul des distances...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {/* Suggestion IA */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-green-600 font-bold">✓ Suggestion IA</span>
              {!result.aiEnabled && <span className="text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">Mode distance</span>}
            </div>
            <div className="font-semibold text-slate-800 text-sm mb-1">{result.suggestion.vehicleName}</div>
            <p className="text-slate-600 text-xs">{result.suggestion.reasoning}</p>
            {result.suggestion.urgencyNote && (
              <p className="text-red-600 text-xs mt-1 font-medium">⚡ {result.suggestion.urgencyNote}</p>
            )}
          </div>

          {/* Liste véhicules triés */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-2">Flotte triée par distance au patient :</p>
            <div className="space-y-2">
              {result.vehicles.map((v, i) => (
                <div key={v.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${i === 0 ? 'border-green-300 bg-green-50' : 'border-slate-200 bg-white'}`}>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-xs w-4">{i + 1}</span>
                    <div>
                      <div className="text-sm font-medium text-slate-800">{v.name}</div>
                      <div className={`text-xs ${STATUS_COLOR[v.status] || 'text-slate-500'}`}>
                        {v.status === 'available' ? 'Disponible' : v.status === 'on_mission' ? 'En mission' : v.status}
                        {v.distanceKm !== null && ` · ${v.distanceKm} km`}
                      </div>
                    </div>
                  </div>
                  {mission && (
                    <button
                      onClick={() => handleAssign(v.id)}
                      className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Assigner
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button onClick={analyse}
            className="w-full py-2 text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-lg">
            Relancer l'analyse
          </button>
        </div>
      )}
    </Modal>
  )
}
