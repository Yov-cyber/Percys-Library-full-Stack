import { BookOpen, Heart, Github } from 'lucide-react';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-[var(--color-cardBorder)] bg-[var(--color-surfaceAlpha)] backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-8 w-8 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center">
                <BookOpen className="h-4 w-4" />
              </div>
              <span className="font-bold font-display text-[var(--color-text)]">Percy's Library</span>
            </div>
            <p className="text-xs text-[var(--color-textSecondary)] font-light leading-relaxed max-w-xs">
              Tu biblioteca personal de cómics. Organiza, lee y descubre historias con estadísticas, logros y temas personalizados.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-textSecondary)] mb-3">
              Formatos soportados
            </h4>
            <div className="flex flex-wrap gap-2">
              {['CBZ', 'CBR', 'PDF', 'Carpetas'].map((f) => (
                <span
                  key={f}
                  className="text-[10px] font-bold px-2.5 py-1 rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/15"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-textSecondary)] mb-3">
              Atajos de teclado
            </h4>
            <ul className="space-y-1.5 text-xs text-[var(--color-textSecondary)] font-light">
              <li><kbd className="px-1.5 py-0.5 rounded bg-[var(--color-border)] text-[10px] font-mono">←</kbd> / <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-border)] text-[10px] font-mono">→</kbd> Cambiar página en el lector</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-[var(--color-border)] text-[10px] font-mono">Espacio</kbd> Página siguiente</li>
              <li><kbd className="px-1.5 py-0.5 rounded bg-[var(--color-border)] text-[10px] font-mono">Esc</kbd> Salir de pantalla completa</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-[var(--color-cardBorder)] flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-[var(--color-textSecondary)]">
          <p className="flex items-center gap-1">
            © {year} Percy's Library v1.5
            <span className="mx-1">·</span>
            Hecho con <Heart className="h-3 w-3 text-red-400 fill-red-400 inline" /> para lectores
          </p>
          <p className="flex items-center gap-1 opacity-70">
            <Github className="h-3.5 w-3.5" />
            Lectura local y privada
          </p>
        </div>
      </div>
    </footer>
  );
}
