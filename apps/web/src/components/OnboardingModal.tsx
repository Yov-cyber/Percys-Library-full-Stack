import { useState, useEffect } from 'react';
import { X, Upload, FolderSync, Palette, Trophy, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';

const STORAGE_KEY = 'percys-onboarding-done';

interface OnboardingModalProps {
  onImport: () => void;
  onScan: () => void;
  comicCount: number;
}

const steps = [
  {
    icon: Upload,
    title: 'Importa tus cómics',
    description: 'Arrastra archivos CBZ, CBR o PDF desde tu ordenador. También puedes escanear una carpeta local.',
    color: 'text-[var(--color-primary)]',
    bg: 'bg-[var(--color-primary)]/10',
  },
  {
    icon: Palette,
    title: 'Personaliza tu experiencia',
    description: 'Elige entre 6 temas diseñados con psicología del color: confianza, calma, enfoque nocturno y más.',
    color: 'text-[var(--color-accent)]',
    bg: 'bg-[var(--color-accent)]/10',
  },
  {
    icon: Trophy,
    title: 'Sigue tu progreso',
    description: 'Estadísticas, rachas de lectura y logros gamificados te motivan a seguir explorando tu colección.',
    color: 'text-emerald-500',
    bg: 'bg-emerald-500/10',
  },
];

export function OnboardingModal({ onImport, onScan, comicCount }: OnboardingModalProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const done = localStorage.getItem(STORAGE_KEY);
    if (!done && comicCount === 0) {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, [comicCount]);

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="relative w-full max-w-md rounded-3xl glass-card border border-[var(--color-cardBorder)] shadow-2xl overflow-hidden animate-scale-in">
        <div
          className="h-1.5 transition-all duration-500"
          style={{
            background: 'var(--color-gradient)',
            width: `${((step + 1) / steps.length) * 100}%`,
          }}
        />

        <button
          onClick={finish}
          className="absolute top-4 right-4 rounded-xl p-2 text-[var(--color-textSecondary)] hover:bg-[var(--color-background)] transition-colors z-10"
          aria-label="Cerrar bienvenida"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8 text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] font-bold uppercase tracking-wider mb-6">
            <Sparkles className="h-3 w-3" />
            Bienvenido
          </div>

          <div className={cn('mx-auto mb-5 h-16 w-16 rounded-2xl flex items-center justify-center', current.bg)}>
            <Icon className={cn('h-8 w-8', current.color)} />
          </div>

          <h2 id="onboarding-title" className="text-xl font-bold font-display text-[var(--color-text)]">
            {current.title}
          </h2>
          <p className="mt-2 text-sm text-[var(--color-textSecondary)] font-light leading-relaxed">
            {current.description}
          </p>

          <div className="flex justify-center gap-1.5 mt-6">
            {steps.map((_, i) => (
              <div
                key={i}
                className={cn(
                  'h-1.5 rounded-full transition-all duration-300',
                  i === step ? 'w-6 bg-[var(--color-primary)]' : 'w-1.5 bg-[var(--color-border)]'
                )}
              />
            ))}
          </div>
        </div>

        <div className="border-t border-[var(--color-cardBorder)] p-4 flex gap-2">
          {!isLast ? (
            <>
              <button
                onClick={finish}
                className="px-4 py-2.5 text-xs font-semibold text-[var(--color-textSecondary)] rounded-xl hover:bg-[var(--color-background)] transition-all"
              >
                Saltar
              </button>
              <button
                onClick={() => setStep((s) => s + 1)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white active:scale-95 transition-all"
                style={{ background: 'var(--color-gradient)' }}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { finish(); onScan(); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[var(--color-cardBorder)] text-xs font-bold text-[var(--color-text)] hover:bg-[var(--color-background)] transition-all"
              >
                <FolderSync className="h-4 w-4" />
                Escanear carpeta
              </button>
              <button
                onClick={() => { finish(); onImport(); }}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold text-white active:scale-95 transition-all"
                style={{ background: 'var(--color-gradient)' }}
              >
                <Upload className="h-4 w-4" />
                Importar ahora
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
