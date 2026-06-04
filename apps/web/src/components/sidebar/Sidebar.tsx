import { useState } from 'react';
import { 
  Home, Library, Tag, Star, BarChart3, Trophy, Settings,
  ChevronLeft, ChevronRight, Dices, Sparkles, BookOpen, X
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { useTheme } from '../../hooks/useTheme';
import { Comic } from '../../types';

interface SidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  comics: Comic[];
  onSurpriseMe: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ currentSection, onSectionChange, comics, onSurpriseMe, mobileOpen, onMobileClose }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { currentTheme } = useTheme();

  const totalComics = comics.length;
  const favoritesCount = comics.filter(c => c.isFavorite).length;

  const menuItems = [
    { id: 'dashboard', icon: Home, label: 'Inicio', description: 'Tu panel personal' },
    { id: 'library', icon: Library, label: 'Biblioteca', description: 'Todos tus cómics', badge: totalComics > 0 ? totalComics : undefined },
    { id: 'categories', icon: Tag, label: 'Categorías', description: 'Géneros y carpetas' },
    { id: 'favorites', icon: Star, label: 'Favoritos', description: 'Tus cómics preferidos', badge: favoritesCount > 0 ? favoritesCount : undefined, badgeColor: 'bg-amber-500' },
    { id: 'stats', icon: BarChart3, label: 'Estadísticas', description: 'Tu progreso de lectura' },
    { id: 'achievements', icon: Trophy, label: 'Logros', description: 'Desbloquea medallas' },
    { id: 'settings', icon: Settings, label: 'Ajustes', description: 'Personalizar biblioteca' },
  ];

  const handleNav = (id: string) => {
    onSectionChange(id);
    onMobileClose?.();
  };

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center justify-between border-b border-[var(--color-cardBorder)] px-4">
        {(!isCollapsed || mobileOpen) && (
          <div className="flex items-center gap-3 select-none">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)] text-white shadow-glow">
              <BookOpen className="h-5 w-5" />
            </div>
            <h1 className="text-base font-bold text-[var(--color-text)] font-display tracking-tight text-gradient">
              Percy's Library
            </h1>
          </div>
        )}
        {isCollapsed && !mobileOpen && (
          <div className="flex h-9 w-9 items-center justify-center mx-auto rounded-xl bg-[var(--color-primary)] text-white shadow-glow">
            <BookOpen className="h-5 w-5" />
          </div>
        )}
        {mobileOpen && onMobileClose && (
          <button
            onClick={onMobileClose}
            className="ml-auto rounded-xl p-2 text-[var(--color-textSecondary)] hover:bg-[var(--color-background)] lg:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        {!mobileOpen && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex absolute -right-3 top-5 h-6 w-6 items-center justify-center rounded-full border border-[var(--color-cardBorder)] bg-[var(--color-surface)] text-[var(--color-textSecondary)] transition-all hover:text-[var(--color-text)] hover:scale-110 shadow-sm"
            aria-label={isCollapsed ? 'Expandir menú' : 'Colapsar menú'}
          >
            {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
          </button>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1" aria-label="Navegación">
        <ul className="space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            const showLabels = !isCollapsed || mobileOpen;

            return (
              <li key={item.id} className="relative group">
                <button
                  onClick={() => handleNav(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition-all relative overflow-hidden min-h-[44px]',
                    isActive
                      ? 'bg-[var(--color-primary)] text-white shadow-glow'
                      : 'text-[var(--color-textSecondary)] hover:bg-[var(--color-background)] hover:text-[var(--color-text)] hover:scale-[1.02]'
                  )}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {isActive && (
                    <span className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--color-accent)] rounded-r-full animate-pulse" />
                  )}
                  <Icon className={cn('h-5 w-5 flex-shrink-0 transition-transform', isActive ? 'text-[var(--color-accent)]' : 'group-hover:scale-110')} />
                  {showLabels && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="block text-sm font-semibold truncate font-display">{item.label}</span>
                        {item.badge !== undefined && (
                          <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-bold text-white animate-pulse', item.badgeColor || 'bg-[var(--color-primary)] border border-white/20')}>
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <span className="block text-[10px] opacity-70 truncate font-light mt-0.5">{item.description}</span>
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-3 border-t border-[var(--color-cardBorder)] space-y-3">
        <button
          onClick={() => { onSurpriseMe(); onMobileClose?.(); }}
          className={cn(
            'w-full flex items-center justify-center gap-2.5 rounded-xl py-3 px-4 text-xs font-bold text-white transition-all shadow-md active:scale-95 hover:opacity-95 min-h-[44px] glow-btn hover:scale-105',
            isCollapsed && !mobileOpen ? 'h-11 w-11 p-0 mx-auto' : ''
          )}
          style={{ background: 'var(--color-gradient)' }}
        >
          <Dices className="h-4.5 w-4.5" />
          {(!isCollapsed || mobileOpen) && (
            <span className="flex items-center gap-1.5">
              ¡Sorpréndeme! <Sparkles className="h-3 w-3 text-yellow-300 animate-pulse" />
            </span>
          )}
        </button>

        {(!isCollapsed || mobileOpen) && (
          <div className="rounded-xl bg-[var(--color-background)] p-3 border border-[var(--color-cardBorder)] hover:shadow-md transition-shadow duration-300">
            <div className="flex items-center gap-2">
              <div
                className="h-5 w-5 rounded-full border border-white/20 shadow-sm animate-pulse"
                style={{ background: currentTheme.colors.gradient || currentTheme.colors.primary }}
              />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-bold text-[var(--color-textSecondary)] uppercase tracking-wider">Tema Activo</p>
                <p className="text-xs font-semibold text-[var(--color-text)] truncate mt-0.5">{currentTheme.name}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={onMobileClose}
          aria-hidden="true"
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-50 h-screen w-72 flex flex-col glass-sidebar transition-transform duration-300 lg:hidden',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-hidden={!mobileOpen}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex fixed left-0 top-0 z-40 h-screen transition-all duration-300 flex-col glass-sidebar',
          isCollapsed ? 'w-20' : 'w-72'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
