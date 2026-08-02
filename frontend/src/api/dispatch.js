import client from './client.js'

export const suggestVehicle = (data) =>
  client.post('/api/dispatch/suggest', data).then(r => r.data)

export const geocodeAddress = (address) =>
  client.post('/api/dispatch/geocode', { address }).then(r => r.data)
