import client from './client.js'

export const getEmployees = () =>
  client.get('/api/employees').then(r => r.data)

export const createEmployee = (data) =>
  client.post('/api/employees', data).then(r => r.data)

export const updateEmployee = (id, data) =>
  client.put(`/api/employees/${id}`, data).then(r => r.data)

export const deleteEmployee = (id) =>
  client.delete(`/api/employees/${id}`).then(r => r.data)
