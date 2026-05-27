import client from './client.js'

export const sitesApi = {
  list: () => client.get('/api/sites').then(r => r.data),
  create: (data) => client.post('/api/sites', data).then(r => r.data),
  update: (id, data) => client.put(`/api/sites/${id}`, data).then(r => r.data),
  remove: (id) => client.delete(`/api/sites/${id}`).then(r => r.data),
}
