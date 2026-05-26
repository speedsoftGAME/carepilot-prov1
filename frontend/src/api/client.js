import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

// Injecte le token JWT sur chaque requête
client.interceptors.request.use((config) => {
  const raw = localStorage.getItem('carepilot-store')
  if (raw) {
    try {
      const { state } = JSON.parse(raw)
      if (state?.token) config.headers.Authorization = `Bearer ${state.token}`
    } catch { /* ignore */ }
  }
  return config
})

// Sur 401, tente un refresh puis rejoue la requête
client.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true
      const raw = localStorage.getItem('carepilot-store')
      if (raw) {
        try {
          const { state } = JSON.parse(raw)
          if (state?.refreshToken) {
            const { data } = await axios.post(
              `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
              { refreshToken: state.refreshToken }
            )
            const { useStore } = await import('../store/useStore.js')
            useStore.getState().setToken(data.accessToken)
            original.headers.Authorization = `Bearer ${data.accessToken}`
            return client(original)
          }
        } catch { /* refresh failed, logout */ }
      }
      const { useStore } = await import('../store/useStore.js')
      useStore.getState().logout()
    }
    return Promise.reject(err)
  }
)

export default client
