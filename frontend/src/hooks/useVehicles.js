import { useEffect, useCallback } from 'react'
import useStore from '../store/useStore.js'
import * as api from '../api/vehicles.js'

export function useVehicles() {
  const { vehicles, setVehicles, updateVehicle, addToast } = useStore()

  const fetch = useCallback(async () => {
    try {
      const data = await api.getVehicles()
      setVehicles(data)
    } catch {
      addToast('Impossible de charger la flotte', 'error')
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const create = async (data) => {
    const v = await api.createVehicle(data)
    setVehicles([...vehicles, v])
    addToast(`${v.name} ajouté à la flotte`, 'success')
    return v
  }

  const update = async (id, data) => {
    const v = await api.updateVehicle(id, data)
    updateVehicle(id, v)
    addToast('Véhicule mis à jour', 'success')
    return v
  }

  const changeStatus = async (id, status) => {
    const v = await api.updateVehicleStatus(id, status)
    updateVehicle(id, v)
    return v
  }

  const remove = async (id) => {
    await api.deleteVehicle(id)
    setVehicles(vehicles.filter(v => v.id !== id))
    addToast('Véhicule supprimé', 'success')
  }

  return { vehicles, fetch, create, update, changeStatus, remove }
}
