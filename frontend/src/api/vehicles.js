import client from './client.js'

export const getVehicles = (params) =>
  client.get('/api/vehicles', { params }).then(r => r.data)

export const getVehicle = (id) =>
  client.get(`/api/vehicles/${id}`).then(r => r.data)

export const createVehicle = (data) =>
  client.post('/api/vehicles', data).then(r => r.data)

export const updateVehicle = (id, data) =>
  client.put(`/api/vehicles/${id}`, data).then(r => r.data)

export const updateVehicleStatus = (id, status) =>
  client.patch(`/api/vehicles/${id}/status`, { status }).then(r => r.data)

export const deleteVehicle = (id) =>
  client.delete(`/api/vehicles/${id}`).then(r => r.data)
