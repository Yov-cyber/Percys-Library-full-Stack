import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-6">
          <div className="max-w-md w-full rounded-3xl glass-card border border-[var(--color-cardBorder)] p-8 text-center shadow-xl">
            <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <h1 className="text-lg font-bold text-[var(--color-text)] font-display">
              {this.props.fallbackTitle ?? 'Algo salió mal'}
            </h1>
            <p className="mt-2 text-sm text-[var(--color-textSecondary)] font-light">
              La aplicación encontró un error inesperado. Puedes reintentar o volver al inicio.
            </p>
            {this.state.error && (
              <p className="mt-3 text-xs text-red-500/80 font-mono bg-red-500/5 rounded-xl p-3 text-left break-all">
                {this.state.error.message}
              </p>
            )}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white active:scale-95 transition-all"
                style={{ background: 'var(--color-gradient)' }}
              >
                <RefreshCw className="h-4 w-4" />
                Reintentar
              </button>
              <a
                href="/"
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--color-cardBorder)] text-xs font-bold text-[var(--color-text)] hover:bg-[var(--color-background)] transition-all"
              >
                <Home className="h-4 w-4" />
                Ir al inicio
              </a>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
