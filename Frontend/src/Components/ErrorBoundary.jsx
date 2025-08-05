import React from "react"

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-red-100 text-red-800 text-lg font-semibold">
          <div>
            <p>⚠️ Something went wrong while loading this page.</p>
            <p className="text-sm mt-2">Please try again later or check the console for details.</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
