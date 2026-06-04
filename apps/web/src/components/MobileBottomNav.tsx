import { Home, Library, Star, BarChart3, Settings } from 'lucide-react';
import { cn } from '../utils/cn';

const tabs = [
  { id: 'dashboard', icon: Home, label: 'Inicio' },
  { id: 'library', icon: Library, label: 'Biblioteca' },
  { id: 'favorites', icon: Star, label: 'Favoritos' },
  { id: 'stats', icon: BarChart3, label: 'Stats' },
  { id: 'settings', icon: Settings, label: 'Ajustes' },
];

interface MobileBottomNavProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
}

export function MobileBottomNav({ currentSection, onSectionChange }: MobileBottomNavProps) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--color-cardBorder)] bg-[var(--color-surfaceAlpha)] backdrop-blur-xl safe-bottom transition-all duration-300"
      aria-label="Navegación principal"
    >
      <div className="flex items-stretch justify-around px-1 pt-1 pb-1">
        {tabs.map(({ id, icon: Icon, label }) => {
          const active = currentSection === id;
          return (
            <button
              key={id}
              onClick={() => onSectionChange(id)}
              className={cn(
                'relative flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all min-w-[56px] min-h-[44px]',
                active
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-textSecondary)] hover:text-[var(--color-text)] hover:scale-105'
              )}
              aria-current={active ? 'page' : undefined}
              aria-label={label}
            >
              <Icon className={cn('h-5 w-5 transition-transform', active && 'scale-110')} />
              <span className="text-[9px] font-bold font-display">{label}</span>
              {active && (
                <span className="absolute bottom-1 h-0.5 w-6 rounded-full bg-[var(--color-primary)] animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
