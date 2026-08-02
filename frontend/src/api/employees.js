import client from './client.js'

export const employeesApi = {
  list: () => client.get('/api/employees').then(r => r.data),
  create: (data) => client.post('/api/employees', data).then(r => r.data),
  update: (id, data) => client.put(`/api/employees/${id}`, data).then(r => r.data),
  remove: (id) => client.delete(`/api/employees/${id}`).then(r => r.data),
  pinAuth: (pin) => client.post('/api/employees/pin-auth', { pin }).then(r => r.data),
}

// Legacy named exports for backwards compatibility
export const getEmployees = employeesApi.list
export const createEmployee = employeesApi.create
export const updateEmployee = employeesApi.update
export const deleteEmployee = employeesApi.remove
