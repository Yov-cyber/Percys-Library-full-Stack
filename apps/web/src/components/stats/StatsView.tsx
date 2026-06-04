import { useStats } from '../../hooks/useStats';
import { ReadingTimeChart } from './ReadingTimeChart';
import { GenreDistributionChart } from './GenreDistributionChart';
import { 
  BookOpen, 
  Flame, 
  CheckCircle2, 
  Hourglass, 
  Clock, 
  Star,
  Play,
  TrendingUp,
  Bookmark
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatsViewProps {
  onComicClick: (comicId: string) => void;
}

export function StatsView({ onComicClick }: StatsViewProps) {
  const { stats, loading, error } = useStats();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="h-8 w-8 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
        <span className="text-sm text-[var(--color-textSecondary)]">Cargando estadísticas detalladas...</span>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="text-center py-12 text-sm text-red-500">
        Error al cargar estadísticas. Reintenta más tarde.
      </div>
    );
  }

  // Generate GitHub style heatmap data for the last 16 weeks (approx. 4 months)
  const renderHeatmap = () => {
    // Group days by date key
    const daysMap = new Map<string, number>();
    stats.days.forEach(d => {
      // Date comes as YYYY-MM-DD from server
      const dateStr = d.date.split('T')[0];
      daysMap.set(dateStr, d.pagesRead);
    });

    const weeks = [];
    const today = new Date();
    // Get start date (16 weeks ago, aligned to Monday)
    const startDate = new Date();
    startDate.setDate(today.getDate() - 16 * 7);
    const dayOfWeek = startDate.getDay();
    const diff = startDate.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // adjust to Monday
    startDate.setDate(diff);

    let currentDate = new Date(startDate);
    
    for (let w = 0; w < 17; w++) {
      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const dateKey = currentDate.toISOString().split('T')[0];
        const pages = daysMap.get(dateKey) || 0;
        weekDays.push({
          date: new Date(currentDate),
          dateKey,
          pages
        });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      weeks.push(weekDays);
    }

    const getColorClass = (pages: number) => {
      if (pages === 0) return 'bg-[var(--color-border)]/60';
      if (pages < 5) return 'bg-[var(--color-primary)]/25';
      if (pages < 15) return 'bg-[var(--color-primary)]/45';
      if (pages < 30) return 'bg-[var(--color-primary)]/70';
      return 'bg-[var(--color-primary)]';
    };

    return (
      <div className="rounded-2xl glass-card p-6 border border-[var(--color-cardBorder)] shadow-md overflow-x-auto">
        <div className="mb-4">
          <h3 className="text-base font-bold text-[var(--color-text)] font-display">
            Heatmap de Lectura
          </h3>
          <p className="text-[11px] text-[var(--color-textSecondary)] font-light">
            Días activos en los últimos 4 meses
          </p>
        </div>
        
        <div className="flex gap-1.5 min-w-[500px] justify-center mt-2">
          {weeks.map((week, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {week.map((day, dIdx) => (
                <div
                  key={day.dateKey}
                  className={cn(
                    "w-4 h-4 rounded-[3px] transition-all hover:scale-125 cursor-pointer relative group",
                    getColorClass(day.pages)
                  )}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-[var(--color-surface)] border border-[var(--color-cardBorder)] text-[10px] font-bold text-[var(--color-text)] opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-lg whitespace-nowrap">
                    {day.pages} páginas el {day.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="flex justify-end items-center gap-1.5 mt-3 text-[10px] text-[var(--color-textSecondary)] font-bold uppercase tracking-wider pr-4">
          <span>Menos</span>
          <div className="w-3.5 h-3.5 rounded-[2px] bg-[var(--color-border)]/60" />
          <div className="w-3.5 h-3.5 rounded-[2px] bg-[var(--color-primary)]/25" />
          <div className="w-3.5 h-3.5 rounded-[2px] bg-[var(--color-primary)]/45" />
          <div className="w-3.5 h-3.5 rounded-[2px] bg-[var(--color-primary)]/70" />
          <div className="w-3.5 h-3.5 rounded-[2px] bg-[var(--color-primary)]" />
          <span>Más</span>
        </div>
      </div>
    );
  };

  // Convert stats.days to ReadingTimeChart format
  const chartDays = [...stats.days]
    .slice(-7)
    .map(d => ({
      date: d.date,
      pagesRead: d.pagesRead
    }));

  return (
    <div className="space-y-8 max-w-7xl mx-auto stagger-in pb-12">
      {/* Page Title */}
      <div className="px-1">
        <h2 className="text-2xl font-bold text-[var(--color-text)] font-display">Estadísticas de Lectura</h2>
        <p className="text-xs text-[var(--color-textSecondary)] font-light mt-0.5">Métricas de progreso y actividad de biblioteca</p>
      </div>

      {/* Grid Hero Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        {/* Total Cómics */}
        <div className="rounded-2xl glass-card p-4 flex flex-col justify-between hover-lift">
          <span className="text-[10px] font-bold text-[var(--color-textSecondary)] uppercase tracking-wider block">Total Cómics</span>
          <div className="flex justify-between items-end mt-4">
            <span className="text-2xl font-bold font-display leading-none">{stats.totalComics}</span>
            <BookOpen className="h-5 w-5 text-blue-500" />
          </div>
        </div>

        {/* Completados */}
        <div className="rounded-2xl glass-card p-4 flex flex-col justify-between hover-lift">
          <span className="text-[10px] font-bold text-[var(--color-textSecondary)] uppercase tracking-wider block">Leídos</span>
          <div className="flex justify-between items-end mt-4">
            <span className="text-2xl font-bold font-display leading-none">{stats.completedComics}</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          </div>
        </div>

        {/* En progreso */}
        <div className="rounded-2xl glass-card p-4 flex flex-col justify-between hover-lift">
          <span className="text-[10px] font-bold text-[var(--color-textSecondary)] uppercase tracking-wider block">En Progreso</span>
          <div className="flex justify-between items-end mt-4">
            <span className="text-2xl font-bold font-display leading-none">{stats.inProgressComics}</span>
            <Hourglass className="h-5 w-5 text-orange-500" />
          </div>
        </div>

        {/* Páginas Leídas */}
        <div className="rounded-2xl glass-card p-4 flex flex-col justify-between hover-lift">
          <span className="text-[10px] font-bold text-[var(--color-textSecondary)] uppercase tracking-wider block">Páginas</span>
          <div className="flex justify-between items-end mt-4">
            <span className="text-2xl font-bold font-display leading-none">{stats.pagesRead}</span>
            <TrendingUp className="h-5 w-5 text-[var(--color-primary)]" />
          </div>
        </div>

        {/* Racha */}
        <div className="rounded-2xl glass-card p-4 flex flex-col justify-between hover-lift">
          <span className="text-[10px] font-bold text-[var(--color-textSecondary)] uppercase tracking-wider block">Racha Máx</span>
          <div className="flex justify-between items-end mt-4">
            <span className="text-2xl font-bold font-display leading-none">{stats.longestStreak}d</span>
            <Flame className="h-5 w-5 text-rose-500" />
          </div>
        </div>

        {/* Tiempo estimado */}
        <div className="rounded-2xl glass-card p-4 flex flex-col justify-between hover-lift">
          <span className="text-[10px] font-bold text-[var(--color-textSecondary)] uppercase tracking-wider block">Tiempo Total</span>
          <div className="flex justify-between items-end mt-4">
            <span className="text-xl font-bold font-display leading-none truncate">{Math.round(stats.totalReadingTimeMinutes)}m</span>
            <Clock className="h-5 w-5 text-amber-500" />
          </div>
        </div>
      </div>

      {/* Main Stats Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ReadingTimeChart data={chartDays} />
        
        <GenreDistributionChart 
          title="Tus Categorías"
          data={stats.categories.map(c => ({ key: c.key, count: c.count }))} 
        />
      </div>

      {/* Format & Heatmap */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {renderHeatmap()}
        </div>

        <div>
          <GenreDistributionChart 
            title="Formatos Disponibles"
            data={stats.formats.map(f => ({ key: f.key.toUpperCase(), count: f.count }))} 
          />
        </div>
      </div>

      {/* Bottom Lists: Almost Done & Top Read */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Casi terminados */}
        <div className="space-y-4">
          <h3 className="text-base font-bold font-display text-[var(--color-text)] flex items-center gap-2 px-1">
            <Bookmark className="h-4.5 w-4.5 text-orange-500" />
            Casi Terminados
          </h3>
          <div className="rounded-2xl glass-card p-4 space-y-3.5 border border-[var(--color-cardBorder)]">
            {stats.almostDone.length === 0 ? (
              <div className="text-center py-8 text-xs text-[var(--color-textSecondary)]">
                No tienes ningún cómic a punto de terminar.
              </div>
            ) : (
              stats.almostDone.map((c) => {
                const percent = Math.round((c.currentPage / c.pageCount) * 100);
                return (
                  <div key={c.id} className="flex items-center justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[var(--color-text)] font-display truncate">{c.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-1.5 w-24 bg-[var(--color-border)] rounded-full overflow-hidden">
                          <div className="h-full bg-orange-500 rounded-full" style={{ width: `${percent}%` }} />
                        </div>
                        <span className="text-[10px] text-[var(--color-textSecondary)]">{percent}%</span>
                      </div>
                    </div>
                    <button
                      onClick={() => onComicClick(c.id)}
                      className="h-8 w-8 rounded-xl bg-orange-500/10 text-orange-500 hover:bg-orange-500 hover:text-white flex items-center justify-center transition-all active:scale-95 flex-shrink-0"
                      title="Terminar lectura"
                    >
                      <Play className="h-3 w-3 fill-current ml-0.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Cómics Favoritos / Más Leídos */}
        <div className="space-y-4">
          <h3 className="text-base font-bold font-display text-[var(--color-text)] flex items-center gap-2 px-1">
            <Star className="h-4.5 w-4.5 text-amber-500" />
            Lecturas Top
          </h3>
          <div className="rounded-2xl glass-card p-4 space-y-3.5 border border-[var(--color-cardBorder)]">
            {stats.topRead.length === 0 ? (
              <div className="text-center py-8 text-xs text-[var(--color-textSecondary)]">
                Aún no has leído suficientes páginas.
              </div>
            ) : (
              stats.topRead.map((c) => (
                <div key={c.id} className="flex justify-between items-center gap-4">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-[var(--color-text)] font-display truncate">{c.title}</h4>
                    <p className="text-[9px] text-[var(--color-textSecondary)] mt-0.5 uppercase font-bold tracking-wider">{c.format}</p>
                  </div>
                  <span className="text-[11px] font-bold text-[var(--color-text)] bg-[var(--color-border)]/50 px-2 py-0.5 rounded-lg font-display flex-shrink-0">
                    {c.currentPage} pgs leídas
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
