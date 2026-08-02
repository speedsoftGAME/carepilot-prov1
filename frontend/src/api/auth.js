import client from './client.js'

export const login = (email, password) =>
  client.post('/api/auth/login', { email, password }).then(r => r.data)

export const register = (companyName, email, password, name) =>
  client.post('/api/auth/register', { companyName, email, password, name }).then(r => r.data)

export const getMe = () =>
  client.get('/api/auth/me').then(r => r.data)

export const refresh = (refreshToken) =>
  client.post('/api/auth/refresh', { refreshToken }).then(r => r.data)
