import client from './client.js'

export const billingApi = {
  getBTs: (month) => client.get('/api/billing/bt', { params: { month } }).then(r => r.data),
  createBT: (data) => client.post('/api/billing/bt', data).then(r => r.data),
  updateStatus: (id, status) => client.patch(`/api/billing/bt/${id}/status`, { status }).then(r => r.data),
  getPdfUrl: (id) => `/api/billing/bt/${id}/pdf`,
  getStatus: () => client.get('/api/billing/status').then(r => r.data),
  checkout: (plan) => client.post('/api/billing/checkout', { plan }).then(r => r.data),
}
