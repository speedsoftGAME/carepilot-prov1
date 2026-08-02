import client from './client.js'

export const statsApi = {
  overview: (month) => client.get('/api/stats/overview', { params: { month } }).then(r => r.data),
}
