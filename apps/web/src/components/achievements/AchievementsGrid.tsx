import { useState } from 'react';
import { Achievement } from '../../types';
import { AchievementCard } from './AchievementCard';
import { Trophy, Award, Lock, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AchievementsGridProps {
  achievements: Achievement[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export function AchievementsGrid({ achievements, loading, error, onRetry }: AchievementsGridProps) {
  const [activeGroup, setActiveGroup] = useState<string>('all');

  const total = achievements.length;
  const unlocked = achievements.filter((a) => a.unlocked).length;
  const percent = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  // Unpack unique groups
  const groups = ['all', ...Array.from(new Set(achievements.map((a) => a.group)))];

  const getGroupLabel = (group: string) => {
    switch (group?.toLowerCase()) {
      case 'all': return 'Todos';
      case 'pages': return 'Páginas';
      case 'streak': return 'Rachas';
      case 'favorites': return 'Favoritos';
      case 'library': return 'Biblioteca';
      case 'format': return 'Formatos';
      case 'category': return 'Categorías';
      default: return group;
    }
  };

  const filteredAchievements = activeGroup === 'all'
    ? achievements
    : achievements.filter((a) => a.group === activeGroup);

  // Sort: unlocked first, then highest tier first
  const sortedAchievements = [...filteredAchievements].sort((a, b) => {
    if (a.unlocked !== b.unlocked) {
      return a.unlocked ? -1 : 1;
    }
    return b.tier - a.tier;
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <div className="h-8 w-8 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
        <span className="text-sm text-[var(--color-textSecondary)]">Cargando logros...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-sm text-red-500">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white"
            style={{ background: 'var(--color-gradient)' }}
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto stagger-in pb-12">
      {/* Title area */}
      <div className="px-1">
        <h2 className="text-2xl font-bold text-[var(--color-text)] font-display">Tus Logros</h2>
        <p className="text-xs text-[var(--color-textSecondary)] font-light mt-0.5">Completa desafíos de lectura y desbloquea medallas</p>
      </div>

      {/* Global Progress Header Card */}
      <div className="rounded-3xl border border-[var(--color-cardBorder)] bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/5 p-6 flex flex-col md:flex-row gap-6 justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-[var(--color-primary)] text-white flex items-center justify-center shadow-glow animate-float">
            <Trophy className="h-7 w-7 text-yellow-300 fill-current" />
          </div>
          <div>
            <h3 className="text-base font-bold font-display text-[var(--color-text)]">
              Nivel de Coleccionista
            </h3>
            <p className="text-xs text-[var(--color-textSecondary)] mt-0.5">
              Has desbloqueado {unlocked} de {total} medallas en total.
            </p>
          </div>
        </div>

        {/* Progress Bar Widget */}
        <div className="w-full md:w-72 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-[var(--color-text)]">
            <span>Progreso de Colección</span>
            <span>{percent}%</span>
          </div>
          <div className="h-3 w-full bg-[var(--color-border)] rounded-full overflow-hidden border border-[var(--color-cardBorder)]">
            <div 
              className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-full transition-all duration-700" 
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Tabs Chips */}
      <div className="flex flex-wrap gap-2 border-b border-[var(--color-cardBorder)] pb-4">
        {groups.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGroup(g)}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-semibold font-display transition-all active:scale-95",
              activeGroup === g
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "bg-[var(--color-background)]/80 text-[var(--color-textSecondary)] border border-[var(--color-cardBorder)] hover:text-[var(--color-text)]"
            )}
          >
            {getGroupLabel(g)}
          </button>
        ))}
      </div>

      {/* Grid List */}
      {sortedAchievements.length === 0 ? (
        <div className="text-center py-12 text-sm text-[var(--color-textSecondary)]">
          No hay logros disponibles en este filtro.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedAchievements.map((achievement) => (
            <AchievementCard key={achievement.id} achievement={achievement} />
          ))}
        </div>
      )}
    </div>
  );
}
