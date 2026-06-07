import { Component } from 'react'

// Catches render errors in a subtree so one bad page can't blank the whole app.
export default class ErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('Caught by ErrorBoundary:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card mx-auto max-w-md p-8 text-center">
          <p className="font-display text-2xl">Something hiccuped</p>
          <p className="mt-2 text-sm text-muted">
            Try refreshing — anything you’ve saved is safe.
          </p>
          <button className="btn-primary mt-5" onClick={() => window.location.reload()}>
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
