import { useRef, useState } from 'react'

export default function SignatureCanvas({ onSave, onCancel }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const [isEmpty, setIsEmpty] = useState(true)

  const getPos = (e) => {
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()
    const src = e.touches?.[0] || e
    return {
      x: (src.clientX - rect.left) * (canvas.width / rect.width),
      y: (src.clientY - rect.top) * (canvas.height / rect.height),
    }
  }

  const start = (e) => {
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e)
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
    drawing.current = true
    setIsEmpty(false)
  }

  const move = (e) => {
    if (!drawing.current) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const pos = getPos(e)
    ctx.lineTo(pos.x, pos.y)
    ctx.strokeStyle = '#1F2937'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.stroke()
  }

  const end = () => { drawing.current = false }

  const clear = () => {
    const canvas = canvasRef.current
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
  }

  const save = () => onSave(canvasRef.current.toDataURL('image/png'))

  return (
    <div>
      <p className="text-xs mb-2" style={{ color: '#64748B' }}>Signez dans le cadre ci-dessous (souris ou doigt)</p>
      <canvas
        ref={canvasRef}
        width={500} height={180}
        style={{ border: '2px dashed #E2E8F0', borderRadius: 10, touchAction: 'none', cursor: 'crosshair', background: '#FAFAFA', width: '100%' }}
        onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
        onTouchStart={start} onTouchMove={move} onTouchEnd={end}
      />
      <div className="flex gap-2 mt-3">
        <button onClick={clear}
          className="flex-1 py-2 rounded-lg text-sm border font-semibold" style={{ color: '#64748B' }}>
          Effacer
        </button>
        <button onClick={onCancel}
          className="flex-1 py-2 rounded-lg text-sm border font-semibold" style={{ color: '#64748B' }}>
          Annuler
        </button>
        <button onClick={save} disabled={isEmpty}
          className="flex-1 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: isEmpty ? '#CBD5E1' : '#1565C0' }}>
          Valider ✓
        </button>
      </div>
    </div>
  )
}
