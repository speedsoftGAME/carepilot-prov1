import { useEffect, useRef } from 'react'
import { io } from 'socket.io-client'
import useStore from '../store/useStore.js'

let socket = null

export function useSocket() {
  const user = useStore(s => s.user)
  const token = useStore(s => s.token)
  const connected = useStore(s => s.socketConnected ?? false)

  useEffect(() => {
    if (!user?.companyId || !token) return

    if (socket) socket.disconnect()

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
    socket = io(apiUrl, { auth: { token }, transports: ['websocket', 'polling'] })

    socket.on('connect', () => {
      useStore.setState({ socketConnected: true })
      socket.emit('join', { companyId: user.companyId, token })
    })

    socket.on('disconnect', () => useStore.setState({ socketConnected: false }))

    socket.on('vehicle:position', ({ vehicleId, lat, lng }) => {
      useStore.getState().updateVehicle(vehicleId, { lat, lng })
    })

    socket.on('notification', ({ type, title, message }) => {
      useStore.getState().addToast(`${title}${message ? ' — ' + message : ''}`, type === 'urgent' ? 'error' : 'info')
    })

    return () => {
      socket?.disconnect()
      socket = null
      useStore.setState({ socketConnected: false })
    }
  }, [user?.companyId, token])

  return { connected, socket }
}

export function getSocket() {
  return socket
}
