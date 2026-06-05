import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useStore = create(
  persist(
    (set, get) => ({
      // Auth
      user: null,
      token: null,
      refreshToken: null,
      company: null,

      // UI
      activeTab: 'missions',
      toasts: [],
      socketConnected: false,
      activeSiteId: null,

      // Data
      missions: [],
      vehicles: [],
      sites: [],
      unreadAlerts: 0,

      // Auth actions
      setAuth: (data) => set({
        user: data.user,
        token: data.accessToken,
        refreshToken: data.refreshToken,
        company: data.company,
      }),
      setToken: (token) => set({ token }),
      logout: () => set({ user: null, token: null, refreshToken: null, company: null }),

      // UI actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      setActiveSiteId: (id) => set({ activeSiteId: id }),
      setSites: (sites) => set({ sites }),

      setUnreadAlerts: (nOrFn) => set(s => ({
        unreadAlerts: typeof nOrFn === 'function' ? nOrFn(s.unreadAlerts) : nOrFn,
      })),

      // Toast
      addToast: (message, type = 'info') => {
        const id = Date.now()
        set(s => ({ toasts: [...s.toasts, { id, message, type }] }))
        setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), 4000)
      },
      removeToast: (id) => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),

      // Data actions
      setMissions: (missions) => set({ missions }),
      setVehicles: (vehicles) => set({ vehicles }),
      updateMission: (id, data) => set(s => ({
        missions: s.missions.map(m => m.id === id ? { ...m, ...data } : m)
      })),
      addMission: (mission) => set(s => ({ missions: [mission, ...s.missions] })),
      removeMission: (id) => set(s => ({ missions: s.missions.filter(m => m.id !== id) })),
      updateVehicle: (id, data) => set(s => ({
        vehicles: s.vehicles.map(v => v.id === id ? { ...v, ...data } : v)
      })),
    }),
    {
      name: 'carepilot-store',
      partialize: (s) => ({ user: s.user, token: s.token, refreshToken: s.refreshToken, company: s.company }),
    }
  )
)

export { useStore }
export default useStore
