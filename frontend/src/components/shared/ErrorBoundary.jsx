import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-full flex items-center justify-center p-8" style={{ background: '#F0F4FF' }}>
          <div className="bg-white rounded-2xl border shadow-sm p-8 text-center max-w-sm">
            <div className="text-4xl mb-3">⚠️</div>
            <h3 className="font-bold text-sm mb-1" style={{ color: '#1F2937' }}>Une erreur est survenue</h3>
            <p className="text-xs mb-4" style={{ color: '#64748B' }}>
              {this.state.error?.message || 'Erreur inattendue dans ce panneau.'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="text-xs px-4 py-2 rounded-lg text-white font-semibold"
              style={{ background: '#1565C0' }}
            >
              Réessayer
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
