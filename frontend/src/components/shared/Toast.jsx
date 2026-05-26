import useStore from '../../store/useStore.js'

const ICONS = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' }
const COLORS = {
  success: 'bg-green-600',
  error: 'bg-red-500',
  info: 'bg-blue-600',
  warning: 'bg-orange-500',
}

export default function Toast() {
  const { toasts, removeToast } = useStore()
  if (!toasts.length) return null

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map(t => (
        <div
          key={t.id}
          className={`${COLORS[t.type] || COLORS.info} text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-64 max-w-sm animate-fade-in`}
        >
          <span className="font-bold text-lg">{ICONS[t.type]}</span>
          <span className="flex-1 text-sm">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="opacity-70 hover:opacity-100 text-lg leading-none">×</button>
        </div>
      ))}
    </div>
  )
}
