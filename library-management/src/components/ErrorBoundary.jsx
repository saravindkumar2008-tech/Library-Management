import React, { Component } from "react";
import Button from "./Button";

/**
 * Reusable ErrorBoundary Component
 * Catches JavaScript errors anywhere in the child component tree,
 * logs error details, and renders an accessible fallback UI.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to console or error reporting service
    console.error("ErrorBoundary caught an unexpected rendering error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-container" role="alert">
          <div className="error-boundary-card">
            <div className="error-icon-wrap">
              <span className="error-boundary-icon">⚠️</span>
            </div>

            <h2 className="error-title">Something went wrong</h2>
            <p className="error-subtitle">
              The library portal encountered an unexpected rendering issue.
              Don't worry, your borrowed books and records are completely safe.
            </p>

            <div className="error-boundary-actions">
              <Button
                variant="primary"
                onClick={this.handleReset}
                icon="🔄"
              >
                Try Again
              </Button>

              <Button
                variant="secondary"
                onClick={this.handleGoHome}
                icon="🏠"
              >
                Return to Home
              </Button>

              <Button
                variant="outline"
                onClick={this.handleReload}
                icon="↻"
              >
                Reload Application
              </Button>
            </div>

            {/* Expandable Technical Details */}
            <div className="error-technical-details">
              <button
                type="button"
                className="btn-toggle-details"
                onClick={this.toggleDetails}
              >
                {this.state.showDetails ? "Hide Technical Details ▲" : "Show Technical Details ▼"}
              </button>

              {this.state.showDetails && (
                <div className="error-stack-box">
                  <p className="error-message-text">
                    <strong>Error:</strong> {this.state.error?.toString()}
                  </p>
                  {this.state.errorInfo?.componentStack && (
                    <pre className="error-stack-trace">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
