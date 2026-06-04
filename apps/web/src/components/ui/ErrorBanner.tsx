import { AlertTriangle, RefreshCw, X } from 'lucide-react';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onRetry, onDismiss }: ErrorBannerProps) {
  return (
    <div
      className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 animate-slide-up"
      role="alert"
    >
      <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[var(--color-text)]">Error al cargar datos</p>
        <p className="text-xs text-[var(--color-textSecondary)] mt-0.5">{message}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-red-600 hover:bg-red-500/10 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reintentar
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="p-1.5 rounded-lg text-[var(--color-textSecondary)] hover:text-[var(--color-text)]"
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}
