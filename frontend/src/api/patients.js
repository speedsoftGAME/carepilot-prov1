import client from './client.js'

export const patientsApi = {
  list:   (params) => client.get('/api/patients', { params }).then(r => r.data),
  search: (q)      => client.get('/api/patients', { params: { search: q } }).then(r => r.data),
  create: (data)   => client.post('/api/patients', data).then(r => r.data),
  update: (id, data) => client.put(`/api/patients/${id}`, data).then(r => r.data),
  remove: (id) => client.delete(`/api/patients/${id}`).then(r => r.data),
}
