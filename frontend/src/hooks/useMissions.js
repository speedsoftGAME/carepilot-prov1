import { useEffect, useCallback } from 'react'
import useStore from '../store/useStore.js'
import * as api from '../api/missions.js'

export function useMissions(params) {
  const { missions, setMissions, updateMission, addMission, removeMission, addToast } = useStore()

  const fetch = useCallback(async () => {
    try {
      const data = await api.getMissions(params)
      setMissions(data)
    } catch {
      addToast('Impossible de charger les missions', 'error')
    }
  }, [JSON.stringify(params)])

  useEffect(() => { fetch() }, [fetch])

  const create = async (data) => {
    const mission = await api.createMission(data)
    addMission(mission)
    addToast(`Mission ${mission.numero} créée`, 'success')
    return mission
  }

  const update = async (id, data) => {
    const mission = await api.updateMission(id, data)
    updateMission(id, mission)
    addToast('Mission mise à jour', 'success')
    return mission
  }

  const changeStatus = async (id, status) => {
    const mission = await api.updateStatus(id, status)
    updateMission(id, mission)
    addToast(`Statut → ${statusLabel(status)}`, 'success')
    return mission
  }

  const assign = async (id, vehicleId) => {
    const mission = await api.assignVehicle(id, vehicleId)
    updateMission(id, mission)
    addToast(vehicleId ? 'Véhicule assigné' : 'Véhicule désassigné', 'success')
    return mission
  }

  const remove = async (id) => {
    await api.deleteMission(id)
    removeMission(id)
    addToast('Mission supprimée', 'success')
  }

  return { missions, fetch, create, update, changeStatus, assign, remove }
}

const statusLabel = (s) => ({ waiting: 'En attente', in_progress: 'En cours', done: 'Terminée', cancelled: 'Annulée' }[s] || s)
