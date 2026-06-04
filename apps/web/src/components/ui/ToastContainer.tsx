import { CheckCircle2, AlertTriangle, Info, X, AlertCircle } from 'lucide-react';
import { useToast, ToastType } from '../../hooks/useToast';
import { cn } from '../../utils/cn';

const icons: Record<ToastType, typeof Info> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles: Record<ToastType, string> = {
  success: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  error: 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
  warning: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  info: 'border-[var(--color-primary)]/30 bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
};

export function ToastContainer() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto z-[100] flex flex-col gap-2 md:w-96 pointer-events-none"
      aria-live="polite"
      aria-label="Notificaciones"
    >
      {toasts.map((t) => {
        const Icon = icons[t.type];
        return (
          <div
            key={t.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-xl backdrop-blur-md animate-slide-up glass-card',
              styles[t.type]
            )}
            role="status"
          >
            <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p className="flex-1 text-sm font-medium text-[var(--color-text)]">{t.message}</p>
            <button
              onClick={() => dismiss(t.id)}
              className="rounded-lg p-1 text-[var(--color-textSecondary)] hover:text-[var(--color-text)] transition-colors"
              aria-label="Cerrar notificación"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
