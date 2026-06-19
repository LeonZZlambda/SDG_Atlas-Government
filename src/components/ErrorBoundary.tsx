import { Component, type ComponentChild } from 'preact';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack?: string } | null;
}

interface ErrorBoundaryProps {
  children: ComponentChild;
  fallback?: ComponentChild;
  onError?: (error: Error, errorInfo: { componentStack?: string }) => void;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack?: string }) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Log additional context
    console.error('Component stack:', errorInfo.componentStack);
    console.error('User agent:', navigator.userAgent);
    console.error('Timestamp:', new Date().toISOString());
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
    
    // Store error for debugging (in production, send to error tracking service)
    if (typeof window !== 'undefined' && 'localStorage' in window) {
      try {
        const errorLog = JSON.parse(localStorage.getItem('errorLog') || '[]');
        errorLog.push({
          timestamp: new Date().toISOString(),
          message: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          userAgent: navigator.userAgent,
          url: window.location.href,
        });
        // Keep only last 10 errors
        if (errorLog.length > 10) {
          errorLog.shift();
        }
        localStorage.setItem('errorLog', JSON.stringify(errorLog));
      } catch (e) {
        console.error('Failed to log error to localStorage:', e);
      }
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

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
          margin: '20px',
          border: '1px solid var(--border-color)'
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            margin: '0 auto 20px',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          
          <h2 style={{ color: 'var(--text-primary)', marginBottom: '12px', fontSize: '20px', fontWeight: 700 }}>
            Something went wrong
          </h2>
          
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px', lineHeight: 1.5 }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '12px 24px',
                background: 'var(--accent-color)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              Try Again
            </button>
            
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600,
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = '0.8'}
              onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
            >
              Reload Page
            </button>
          </div>
          
          {process.env.NODE_ENV === 'development' && this.state.error?.stack && (
            <details style={{
              marginTop: '24px',
              textAlign: 'left',
              background: 'rgba(0, 0, 0, 0.05)',
              padding: '16px',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'var(--text-muted)'
            }}>
              <summary style={{ cursor: 'pointer', fontWeight: 600, marginBottom: '8px' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                {this.state.error.stack}
              </pre>
              {this.state.errorInfo?.componentStack && (
                <>
                  <div style={{ fontWeight: 600, marginTop: '12px', marginBottom: '4px' }}>
                    Component Stack:
                  </div>
                  <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0 }}>
                    {this.state.errorInfo.componentStack}
                  </pre>
                </>
              )}
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
