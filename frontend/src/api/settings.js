import client from './client.js'

export const settingsApi = {
  get: () => client.get('/api/settings').then(r => r.data),
  updateCompany: (data) => client.put('/api/settings/company', data).then(r => r.data),
  updateBranding: (data) => client.put('/api/settings/branding', data).then(r => r.data),
  updateSamu: (data) => client.put('/api/settings/samu', data).then(r => r.data),
  getSamuConfig: () => client.get('/api/samu/config').then(r => r.data),
}
