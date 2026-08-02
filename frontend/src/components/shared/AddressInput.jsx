import { useState, useRef } from 'react'

function formatAddr(s) {
  const a = s.address || {}
  const road = a.road ? (a.house_number ? `${a.house_number} ${a.road}` : a.road) : null
  const city = a.city || a.town || a.village || a.municipality || null
  const parts = [road, city, a.postcode].filter(Boolean)
  return parts.length ? parts.join(', ') : s.display_name.split(',').slice(0, 3).join(',').trim()
}

export default function AddressInput({ value, onChange, placeholder, required, className }) {
  const [suggestions, setSuggestions] = useState([])
  const [open, setOpen] = useState(false)
  const [searching, setSearching] = useState(false)
  const timer = useRef(null)
  const cls = className || 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500'

  const search = (val) => {
    onChange(val)
    clearTimeout(timer.current)
    if (val.length < 4) { setSuggestions([]); setOpen(false); return }
    setSearching(true)
    timer.current = setTimeout(async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(val)}&format=json&limit=5&countrycodes=fr&addressdetails=1`
        const res = await fetch(url, { headers: { 'Accept-Language': 'fr' } })
        const data = await res.json()
        setSuggestions(data)
        setOpen(data.length > 0)
      } catch {}
      finally { setSearching(false) }
    }, 400)
  }

  const pick = (s) => {
    onChange(formatAddr(s))
    setSuggestions([])
    setOpen(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        <input
          value={value}
          onChange={e => search(e.target.value)}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
          placeholder={placeholder}
          required={required}
          className={cls}
        />
        {searching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">⏳</span>
        )}
      </div>
      {open && (
        <div className="absolute z-30 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden">
          {suggestions.map((s, i) => (
            <button key={i} type="button"
              onMouseDown={() => pick(s)}
              className="w-full text-left px-3 py-2 hover:bg-blue-50 border-b last:border-0 text-xs flex items-start gap-2">
              <span className="mt-0.5 shrink-0">📍</span>
              <span className="text-slate-700">{formatAddr(s)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
