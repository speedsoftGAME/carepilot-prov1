import client from './client.js'

export const verifyPatient = (data) =>
  client.post('/api/okcare/verify', data).then(r => r.data)

export const getUsage = () =>
  client.get('/api/okcare/usage').then(r => r.data)
