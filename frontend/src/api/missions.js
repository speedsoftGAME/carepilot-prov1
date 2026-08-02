import client from './client.js'

export const getMissions = (params) =>
  client.get('/api/missions', { params }).then(r => {
    // Handle both paginated ({ missions, total }) and legacy array responses
    return Array.isArray(r.data) ? r.data : r.data.missions
  })

export const getMissionsPaginated = (params) =>
  client.get('/api/missions', { params }).then(r => r.data)

export const getMission = (id) =>
  client.get(`/api/missions/${id}`).then(r => r.data)

export const createMission = (data) =>
  client.post('/api/missions', data).then(r => r.data)

export const updateMission = (id, data) =>
  client.put(`/api/missions/${id}`, data).then(r => r.data)

export const updateStatus = (id, status) =>
  client.patch(`/api/missions/${id}/status`, { status }).then(r => r.data)

export const assignVehicle = (id, vehicleId) =>
  client.patch(`/api/missions/${id}/vehicle`, { vehicleId }).then(r => r.data)

export const deleteMission = (id) =>
  client.delete(`/api/missions/${id}`).then(r => r.data)
