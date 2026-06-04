import { useNavigate } from 'react-router-dom';
import { BookOpen, Home, ArrowLeft } from 'lucide-react';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

export function NotFound() {
  const navigate = useNavigate();
  useDocumentTitle('Página no encontrada');

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--color-primary)_0%,transparent_70%)] opacity-[0.07] pointer-events-none" />
      <div className="relative max-w-lg w-full text-center">
        <div className="mx-auto mb-6 h-20 w-20 rounded-3xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center animate-float">
          <BookOpen className="h-10 w-10" />
        </div>
        <p className="text-6xl font-extrabold font-display text-gradient">404</p>
        <h1 className="mt-2 text-xl font-bold text-[var(--color-text)] font-display">
          Esta página no existe
        </h1>
        <p className="mt-2 text-sm text-[var(--color-textSecondary)] font-light max-w-sm mx-auto">
          El cómic o la sección que buscas no está disponible. Vuelve a tu biblioteca para seguir leyendo.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white active:scale-95 transition-all shadow-md"
            style={{ background: 'var(--color-gradient)' }}
          >
            <Home className="h-4 w-4" />
            Ir al inicio
          </button>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--color-cardBorder)] text-sm font-bold text-[var(--color-text)] hover:bg-[var(--color-surface)] transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver atrás
          </button>
        </div>
      </div>
    </div>
  );
}
