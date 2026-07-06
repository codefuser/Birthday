import { Component, ReactNode } from 'react'

interface Props { children: ReactNode; fallback?: ReactNode }
interface State { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }
  static getDerivedStateFromError() { return { hasError: true } }
  componentDidCatch(e: Error) { console.error('Section error:', e) }
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div className="min-h-[100dvh] flex items-center justify-center bg-night-900">
        <p className="text-white/20 text-sm font-sans tracking-widest uppercase" />
      </div>
    }
    return this.props.children
  }
}
