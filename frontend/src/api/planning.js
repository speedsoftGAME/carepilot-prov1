import client from './client.js'

export const planningApi = {
  getWeek: (week) => client.get('/api/planning', { params: { week } }).then(r => r.data),
  upsertCell: (data) => client.put('/api/planning', data).then(r => r.data),
  deleteCell: (employeeId, date) => client.delete(`/api/planning/${employeeId}/${date}`).then(r => r.data),
  exportCsv: (month) => client.get('/api/planning/export-csv', { params: { month }, responseType: 'blob' }).then(r => r.data),
}
