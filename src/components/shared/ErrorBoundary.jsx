import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full min-h-screen items-center justify-center bg-asphalt-900 p-4">
          <div className="rounded-card border border-emergency/30 bg-asphalt-800 p-6 text-center shadow-lg">
            <AlertTriangle size={48} className="mx-auto mb-4 text-emergency" />
            <h2 className="mb-2 text-xl font-bold text-smoke-100">Something went wrong</h2>
            <p className="mb-6 text-sm text-smoke-300">An unexpected error occurred.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary mx-auto flex gap-2"
            >
              <RefreshCw size={18} /> Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
