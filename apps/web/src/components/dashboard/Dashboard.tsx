import { useState, useEffect } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Flame, 
  Star, 
  History, 
  TrendingUp, 
  Dices,
  BookOpenCheck,
  Calendar,
  ChevronRight,
  Clock
} from 'lucide-react';
import { Comic } from '../../types';
import { useStats } from '../../hooks/useStats';
interface DashboardProps {
  onNavigate: (section: string) => void;
  comics: Comic[];
  onComicClick: (comic: Comic) => void;
  onSurpriseMe: () => void;
}

export function Dashboard({ onNavigate, comics, onComicClick, onSurpriseMe }: DashboardProps) {
  const { stats, loading } = useStats();
  const [greeting, setGreeting] = useState('¡Hola, lector!');

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('¡Buenos días, lector!');
    else if (hours < 18) setGreeting('¡Buenas tardes, lector!');
    else setGreeting('¡Buenas noches, lector!');
  }, []);

  // Filter in-progress comics for "Continúa leyendo"
  const inProgressComics = comics
    .filter(c => !c.completed && c.currentPage && c.currentPage > 0)
    .sort((a, b) => {
      const aTime = a.lastRead ? new Date(a.lastRead).getTime() : 0;
      const bTime = b.lastRead ? new Date(b.lastRead).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 4);

  // Recently added or read comics
  const recentComics = [...comics]
    .sort((a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime())
    .slice(0, 3);

  // Format bytes for display
  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto stagger-in pb-12">
      {/* Hero Welcome Card */}
      <div
        className="relative rounded-3xl overflow-hidden p-8 text-white border border-white/10 shadow-glow animate-float"
        style={{ background: 'linear-gradient(135deg, var(--color-hero-bg) 0%, var(--color-secondary) 55%, var(--color-primary) 100%)' }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--color-primary)_0%,transparent_55%)] opacity-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-accent)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-primary)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-xs font-semibold text-white/90 mb-4 animate-pulse-glow">
            <Sparkles className="h-3.5 w-3.5 text-[var(--color-accent)]" />
            <span>Percy's Library Premium</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold font-display tracking-tight leading-tight">
            {greeting}
          </h1>
          <p className="mt-2 text-white/80 text-sm md:text-base font-light leading-relaxed">
            Bienvenido de vuelta a tu centro personal de lectura. Hoy es un gran día para continuar tus historias favoritas o descubrir algo totalmente nuevo en tu colección.
          </p>
          <div className="flex flex-wrap gap-3 mt-6">
            <button
              onClick={() => onNavigate('library')}
              className="px-5 py-2.5 rounded-xl bg-white hover:bg-white/90 text-[var(--color-secondary)] text-xs font-bold transition-all shadow-md hover:scale-105 active:scale-95 flex items-center gap-1.5 glow-btn"
            >
              Ir a la Biblioteca
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onSurpriseMe}
              className="px-5 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all border border-white/25 active:scale-95 flex items-center gap-1.5 hover:scale-105"
            >
              <Dices className="h-4 w-4 text-[var(--color-accent)]" />
              Lectura Aleatoria
            </button>
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Comics */}
        <div className="rounded-2xl glass-card p-5 flex items-center gap-4 hover-lift group cursor-pointer transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center flex-shrink-0 shadow-sm border border-[var(--color-primary)]/15 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xs font-bold text-[var(--color-textSecondary)] uppercase tracking-wider block">Cómics en catálogo</span>
            <span className="text-xl md:text-2xl font-bold font-display mt-0.5 block group-hover:text-[var(--color-primary)] transition-colors">
              {loading ? '...' : (stats?.totalComics ?? 0)}
            </span>
          </div>
        </div>

        {/* Pages Read */}
        <div className="rounded-2xl glass-card p-5 flex items-center gap-4 hover-lift group cursor-pointer transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-[var(--color-secondary)]/10 text-[var(--color-secondary)] flex items-center justify-center flex-shrink-0 shadow-sm border border-[var(--color-secondary)]/15 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
            <BookOpenCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xs font-bold text-[var(--color-textSecondary)] uppercase tracking-wider block">Páginas leídas</span>
            <span className="text-xl md:text-2xl font-bold font-display mt-0.5 block group-hover:text-[var(--color-secondary)] transition-colors">
              {loading ? '...' : (stats?.pagesRead ?? 0)}
            </span>
          </div>
        </div>

        {/* Streak */}
        <div className="rounded-2xl glass-card p-5 flex items-center gap-4 hover-lift group cursor-pointer transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center flex-shrink-0 shadow-sm border border-[var(--color-accent)]/15 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xs font-bold text-[var(--color-textSecondary)] uppercase tracking-wider block">Racha de lectura</span>
            <span className="text-xl md:text-2xl font-bold font-display mt-0.5 block group-hover:text-[var(--color-accent)] transition-colors">
              {loading ? '...' : `${stats?.currentStreak ?? 0} días`}
            </span>
          </div>
        </div>

        {/* Favorites */}
        <div className="rounded-2xl glass-card p-5 flex items-center gap-4 hover-lift group cursor-pointer transition-all duration-300">
          <div className="h-12 w-12 rounded-xl bg-[var(--color-accent)]/10 text-[var(--color-accent)] flex items-center justify-center flex-shrink-0 shadow-sm border border-[var(--color-accent)]/20 group-hover:scale-110 group-hover:shadow-lg transition-all duration-300">
            <Star className="h-6 w-6" />
          </div>
          <div>
            <span className="text-2xs font-bold text-[var(--color-textSecondary)] uppercase tracking-wider block">Favoritos</span>
            <span className="text-xl md:text-2xl font-bold font-display mt-0.5 block group-hover:text-[var(--color-accent)] transition-colors">
              {loading ? '...' : (stats?.favorites ?? 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Columns: Left (Continue Reading) & Right (Recent uploads + metadata) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Continue Reading - Takes 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center px-1">
            <h3 className="text-lg font-bold font-display text-[var(--color-text)] flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[var(--color-primary)]" />
              Continúa Leyendo
            </h3>
            {inProgressComics.length > 0 && (
              <button 
                onClick={() => onNavigate('library')}
                className="text-xs font-bold text-[var(--color-primary)] hover:underline flex items-center"
              >
                Ver todos
              </button>
            )}
          </div>

          {inProgressComics.length === 0 ? (
            <div className="rounded-2xl glass-card p-8 text-center text-sm text-[var(--color-textSecondary)] animate-float">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]/40 flex items-center justify-center mb-4">
                <BookOpen className="h-8 w-8" />
              </div>
              <p className="font-semibold text-sm">No tienes lecturas en progreso actualmente.</p>
              <p className="text-xs mt-1 text-[var(--color-textSecondary)]">¡Abre un cómic en tu biblioteca para empezar!</p>
              <button
                onClick={() => onNavigate('library')}
                className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-xs font-bold hover:bg-[var(--color-primary)]/20 transition-all hover:scale-105 active:scale-95"
              >
                Explorar Biblioteca
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {inProgressComics.map((c) => {
                const percent = c.pageCount && c.pageCount > 0 
                  ? Math.round((c.currentPage || 0) / c.pageCount * 100)
                  : 0;

                return (
                  <div 
                    key={c.id} 
                    onClick={() => onComicClick(c)}
                    className="rounded-2xl glass-card p-4 flex gap-4 hover-lift cursor-pointer relative overflow-hidden group border border-[var(--color-cardBorder)] transition-all duration-300 hover:shadow-xl"
                  >
                    {/* Comic cover thumbnail */}
                    <div className="h-24 w-16 bg-[var(--color-border)] rounded-lg overflow-hidden flex-shrink-0 shadow-md border border-[var(--color-cardBorder)] relative group-hover:scale-105 transition-transform duration-300">
                      <img 
                        src={`/api/comics/${c.id}/cover`} 
                        alt="" 
                        className="h-full w-full object-cover" 
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[var(--color-primary)]/15 text-[var(--color-primary)] font-display tracking-wider">
                          {c.format}
                        </span>
                        <h4 className="text-sm font-bold font-display text-[var(--color-text)] truncate mt-1.5 group-hover:text-[var(--color-primary)] transition-colors">
                          {c.title}
                        </h4>
                        <p className="text-[10px] text-[var(--color-textSecondary)] mt-0.5 truncate">
                          Última lectura: {c.lastRead ? new Date(c.lastRead).toLocaleDateString() : 'Recientemente'}
                        </p>
                      </div>

                      {/* circular circular-like progress block */}
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-[10px] text-[var(--color-textSecondary)] mb-1 font-semibold">
                          <span>Progreso</span>
                          <span>{percent}% ({c.currentPage}/{c.pageCount})</span>
                        </div>
                        <div className="h-1.5 w-full bg-[var(--color-border)] rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-full transition-all duration-500 group-hover:shadow-lg" 
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right side: Reciente / Historial */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold font-display text-[var(--color-text)] flex items-center gap-2 px-1">
            <History className="h-5 w-5 text-[var(--color-accent)]" />
            Novedades
          </h3>

          <div className="rounded-2xl glass-card p-4 space-y-4 border border-[var(--color-cardBorder)] hover:shadow-lg transition-shadow duration-300">
            {recentComics.length === 0 ? (
              <div className="text-center py-8 text-xs text-[var(--color-textSecondary)]">
                <div className="h-12 w-12 mx-auto rounded-xl bg-[var(--color-border)]/50 flex items-center justify-center mb-3">
                  <History className="h-6 w-6 text-[var(--color-textSecondary)]/40" />
                </div>
                Aún no has importado ningún archivo.
              </div>
            ) : (
              <div className="space-y-3.5">
                {recentComics.map((c) => (
                  <div 
                    key={c.id} 
                    onClick={() => onComicClick(c)}
                    className="flex gap-3 items-center group cursor-pointer p-2 rounded-xl hover:bg-[var(--color-background)]/50 transition-all duration-200"
                  >
                    <div className="h-11 w-7.5 bg-[var(--color-border)] rounded-md overflow-hidden flex-shrink-0 shadow-sm border border-[var(--color-cardBorder)] relative group-hover:scale-105 transition-transform duration-200">
                      <img 
                        src={`/api/comics/${c.id}/cover`} 
                        alt="" 
                        className="h-full w-full object-cover" 
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[var(--color-text)] font-display truncate group-hover:text-[var(--color-primary)] transition-colors">
                        {c.title}
                      </h4>
                      <p className="text-[9px] text-[var(--color-textSecondary)] mt-0.5">
                        Agregado el {new Date(c.addedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Library Size Info */}
            {!loading && stats && (
              <div className="border-t border-[var(--color-cardBorder)] pt-3.5 mt-2 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--color-textSecondary)] font-medium flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 text-[var(--color-primary)]" />
                    Tiempo leído estimado
                  </span>
                  <span className="font-bold text-[var(--color-text)] font-display">
                    {Math.round(stats.totalReadingTimeMinutes)} mins
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[var(--color-textSecondary)] font-medium flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-[var(--color-accent)]" />
                    Almacenamiento total
                  </span>
                  <span className="font-bold text-[var(--color-text)] font-display">
                    {formatBytes(stats.totalBytes)}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
