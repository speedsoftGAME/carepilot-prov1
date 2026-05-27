import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'
import { useVehicles } from '../../hooks/useVehicles.js'
import { useSocket } from '../../hooks/useSocket.js'
import useStore from '../../store/useStore.js'

// Fix icône Leaflet en mode Vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const vehicleIcon = (status) => L.divIcon({
  className: '',
  html: `<div style="width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:20px;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);background:${status === 'available' ? '#00C853' : status === 'on_mission' ? '#FF6D00' : '#94A3B8'}">🚑</div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 18],
})

function LiveMarkers({ vehicles }) {
  const map = useMap()
  const markersRef = useRef({})

  useEffect(() => {
    vehicles.forEach(v => {
      if (!v.lat || !v.lng) return
      const pos = [v.lat, v.lng]
      if (markersRef.current[v.id]) {
        markersRef.current[v.id].setLatLng(pos)
      }
    })
  }, [vehicles])

  return vehicles
    .filter(v => v.lat && v.lng)
    .map(v => (
      <Marker key={v.id} position={[v.lat, v.lng]} icon={vehicleIcon(v.status)}
        ref={el => { if (el) markersRef.current[v.id] = el }}>
        <Popup>
          <div className="text-sm">
            <strong>{v.name}</strong><br />
            Type : {v.type}<br />
            Statut : {v.status === 'available' ? '✅ Disponible' : v.status === 'on_mission' ? '🔴 En mission' : '⏸ Indisponible'}<br />
            {v.crew && <span>Équipage : {v.crew}<br /></span>}
            {v.lat && <span>📍 {v.lat.toFixed(5)}°N, {v.lng.toFixed(5)}°E</span>}
          </div>
        </Popup>
      </Marker>
    ))
}

export default function CartePanel() {
  useVehicles()
  const { connected } = useSocket()
  const vehicles = useStore(s => s.vehicles)
  const vehiclesWithPos = vehicles.filter(v => v.lat && v.lng)

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b border-slate-200 px-4 py-2 flex items-center gap-3">
        <span className="text-sm font-medium text-slate-700">🗺️ Carte de la flotte</span>
        <span className="text-xs text-slate-500">{vehiclesWithPos.length} véhicule(s) géolocalisé(s)</span>
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ml-auto ${connected ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
          {connected ? '● GPS live' : '○ Hors ligne'}
        </span>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-xs text-slate-600"><span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Disponible</span>
          <span className="flex items-center gap-1 text-xs text-slate-600"><span className="w-3 h-3 rounded-full bg-orange-500 inline-block" /> En mission</span>
        </div>
      </div>
      <div className="flex-1">
        <MapContainer center={[45.18, 5.72]} zoom={11} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LiveMarkers vehicles={vehicles} />
        </MapContainer>
      </div>
    </div>
  )
}
