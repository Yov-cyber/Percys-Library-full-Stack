import { Trophy, Lock, HelpCircle } from 'lucide-react';
import { Achievement } from '../../types';
import { cn } from '../../utils/cn';

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  // Map group to Emojis
  const getGroupEmoji = (group: string) => {
    switch (group?.toLowerCase()) {
      case 'pages': return '📖';
      case 'streak': return '🔥';
      case 'favorites': return '⭐';
      case 'library': return '📚';
      case 'format': return '💾';
      case 'category': return '🏷️';
      default: return '🏆';
    }
  };

  // Map tier to styled labels and gradients
  const getTierDetails = (tier: number) => {
    switch (tier) {
      case 1: return { label: 'Bronce', border: 'border-[#cd7f32]/45', text: 'text-[#cd7f32]', bg: 'bg-[#cd7f32]/5' };
      case 2: return { label: 'Plata', border: 'border-[#c0c0c0]/45', text: 'text-[#a8a8a8]', bg: 'bg-[#c0c0c0]/5' };
      case 3: return { label: 'Oro', border: 'border-[#ffd700]/45', text: 'text-[#d4af37]', bg: 'bg-[#ffd700]/5' };
      case 4: return { label: 'Platino', border: 'border-[#e5e4e2]/45', text: 'text-[#c0c0c0]', bg: 'bg-[#e5e4e2]/5' };
      case 5: return { label: 'Diamante', border: 'border-[#b9f2ff]/55 shadow-glow shadow-[#b9f2ff]/5', text: 'text-[#70d6ff]', bg: 'bg-[#b9f2ff]/5' };
      default: return { label: 'Bronce', border: 'border-slate-300/40', text: 'text-slate-400', bg: 'bg-slate-500/5' };
    }
  };

  const tier = getTierDetails(achievement.tier);
  const emoji = getGroupEmoji(achievement.group);

  // If secret and not unlocked, blur the details
  const isSecretLocked = achievement.secret && !achievement.unlocked;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-5 transition-all duration-300 hover-lift flex gap-4',
        achievement.unlocked
          ? `${tier.border} bg-[var(--color-surfaceAlpha)]`
          : 'border-[var(--color-cardBorder)] bg-[var(--color-background)]/50 opacity-60'
      )}
    >
      {/* Shine effect for unlocked cards */}
      {achievement.unlocked && (
        <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full hover:animate-shimmer" style={{ animation: 'shimmer 2.5s infinite' }} />
      )}

      {/* Icon Badge */}
      <div
        className={cn(
          'flex h-14 w-14 items-center justify-center rounded-2xl flex-shrink-0 text-2xl relative border shadow-sm',
          achievement.unlocked
            ? `${tier.bg} ${tier.border}`
            : 'bg-[var(--color-border)]/50 border-[var(--color-cardBorder)] text-slate-400'
        )}
      >
        {isSecretLocked ? (
          <Lock className="h-6 w-6 text-slate-400" />
        ) : (
          <span>{emoji}</span>
        )}
      </div>

      {/* Info Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between">
        <div>
          {/* Header Tier */}
          <div className="flex items-center gap-2">
            <span className={cn('text-[9px] font-extrabold uppercase tracking-wider', tier.text)}>
              {tier.label}
            </span>
            {achievement.secret && (
              <span className="text-[9px] font-bold text-violet-400 bg-violet-400/10 px-1.5 py-0.5 rounded">
                Secreto
              </span>
            )}
          </div>

          <h3 className={cn("text-sm font-bold font-display text-[var(--color-text)] truncate mt-1.5", isSecretLocked ? "filter blur-[3px]" : "")}>
            {isSecretLocked ? "Logro Secreto" : achievement.title}
          </h3>

          <p className={cn("text-xs text-[var(--color-textSecondary)] mt-1 font-light leading-relaxed", isSecretLocked ? "filter blur-[4px] select-none" : "")}>
            {isSecretLocked ? "Desbloquea este logro secreto para ver las instrucciones." : achievement.description}
          </p>

          {isSecretLocked && achievement.unlockHint && (
            <p className="text-[10px] text-violet-400/90 italic mt-1.5 flex items-center gap-1">
              <HelpCircle className="h-3.5 w-3.5" />
              Pista: {achievement.unlockHint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
