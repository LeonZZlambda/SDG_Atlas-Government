import { Component, type ComponentChild } from 'preact';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ComponentChild;
  fallback?: ComponentChild;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack?: string }) {
    console.error('Error caught by boundary:', error, errorInfo);
    // TODO: Send to error tracking service
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          background: 'var(--bg-glass)',
          borderRadius: '12px',
          margin: '20px'
        }}>
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>
            Something went wrong
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              background: 'var(--accent-color)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
