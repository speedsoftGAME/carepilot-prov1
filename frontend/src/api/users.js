import client from './client'

export const usersApi = {
  list:         ()           => client.get('/api/users').then(r => r.data),
  create:       (data)       => client.post('/api/users', data).then(r => r.data),
  updateRole:   (id, role)   => client.put(`/api/users/${id}/role`, { role }).then(r => r.data),
  remove:       (id)         => client.delete(`/api/users/${id}`).then(r => r.data),
  updateProfile:(data)       => client.put('/api/auth/me', data).then(r => r.data),
  changePassword:(data)      => client.put('/api/auth/change-password', data).then(r => r.data),
}
