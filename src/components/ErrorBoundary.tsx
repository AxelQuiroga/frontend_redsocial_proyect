import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ textAlign: "center", padding: "4rem 1rem" }}>
          <h1 style={{ fontSize: "2rem", margin: "0 0 0.5rem", color: "var(--color-danger)" }}>
            Algo salió mal
          </h1>
          <p style={{ color: "var(--color-text-secondary)", marginBottom: "2rem" }}>
            {this.state.error?.message || "Ocurrió un error inesperado."}
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={this.handleReset}
          >
            Intentar de nuevo
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
