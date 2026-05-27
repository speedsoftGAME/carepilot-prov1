import client from './client.js'

export const apiKeysApi = {
  list: () => client.get('/api/apikeys').then(r => r.data),
  create: (name) => client.post('/api/apikeys', { name }).then(r => r.data),
  revoke: (id) => client.delete(`/api/apikeys/${id}`).then(r => r.data),
}
