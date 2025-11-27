/* eslint-disable react-refresh/only-export-components */
import { Component, ReactNode, ComponentType, ErrorInfo } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ComponentType<{ error: Error; resetError: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  const handleReload = () => {
    window.location.href = '/';
  };

  return (
    <div style={{
      padding: '40px 20px',
      textAlign: 'center',
      backgroundColor: '#1a1a1a',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ maxWidth: '500px' }}>
        <h2 style={{ color: '#ef4444', marginBottom: '16px', fontSize: '24px', fontWeight: 'bold' }}>
          Something went wrong
        </h2>
        <p style={{ color: '#9ca3af', marginBottom: '24px', lineHeight: '1.6' }}>
          The application encountered an error. Please try refreshing the page or contact support if the problem persists.
        </p>
        <details style={{
          marginBottom: '24px',
          textAlign: 'left',
          backgroundColor: '#262626',
          padding: '12px',
          borderRadius: '6px',
          color: '#ef4444',
          fontSize: '12px'
        }}>
          <summary style={{ cursor: 'pointer', marginBottom: '8px', color: '#9ca3af' }}>
            Error Details
          </summary>
          <code style={{ wordBreak: 'break-word' }}>
            {error.message || 'An unexpected error occurred'}
          </code>
        </details>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={resetError}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Try Again
          </button>
          <button
            onClick={handleReload}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}