export default function EmptyState({ icon = '📋', title, message, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-700 mb-2">{title}</h3>
      {message && <p className="text-slate-500 text-sm mb-6 max-w-sm">{message}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
