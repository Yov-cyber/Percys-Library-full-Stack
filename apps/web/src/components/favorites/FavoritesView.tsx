import { Heart, Star, Sparkles, BookOpen, ArrowRight } from 'lucide-react';
import { Comic } from '../../types';
import { cn } from '../../utils/cn';

interface FavoritesViewProps {
  comics: Comic[];
  onComicClick: (comic: Comic) => void;
  onToggleFavorite: (comicId: string, currentStatus: boolean) => void;
}

export function FavoritesView({ comics, onComicClick, onToggleFavorite }: FavoritesViewProps) {
  const favorites = comics.filter((c) => c.isFavorite);

  // Spotlight: most recently read or added favorite
  const spotlight = favorites.length > 0 
    ? [...favorites].sort((a, b) => {
        const aTime = a.lastRead ? new Date(a.lastRead).getTime() : 0;
        const bTime = b.lastRead ? new Date(b.lastRead).getTime() : 0;
        return bTime - aTime;
      })[0]
    : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto stagger-in pb-12">
      {/* Header Banner (Golden/Amber Premium Gradient) */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-amber-600 via-amber-800 to-yellow-700 p-8 text-white border border-yellow-500/20 shadow-md">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-yellow-400/25 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-300/20 text-xs font-semibold text-yellow-100 mb-4">
            <Star className="h-4 w-4 fill-current text-yellow-300" />
            <span>Tus Favoritos</span>
          </div>
          <h1 className="text-3xl font-extrabold font-display tracking-tight text-white">
            Colección Destacada
          </h1>
          <p className="mt-2 text-yellow-100/90 text-sm font-light max-w-xl">
            Tus cómics y novelas mejor valorados. Una selección curada de tus historias predilectas que merecen un lugar de honor en tu biblioteca.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <span className="text-2xl font-bold font-display text-white">{favorites.length}</span>
            <span className="text-xs uppercase font-extrabold text-yellow-200 tracking-wider">Cómics Destacados</span>
          </div>
        </div>
      </div>

      {/* Spotlight Segment */}
      {spotlight && (
        <div className="rounded-3xl border border-[var(--color-cardBorder)] bg-[var(--color-surfaceAlpha)] p-6 shadow-md flex flex-col md:flex-row gap-6 items-center">
          <div className="h-48 w-32 bg-slate-200 rounded-2xl overflow-hidden shadow-lg border border-black/10 relative flex-shrink-0">
            <img 
              src={`/api/comics/${spotlight.id}/cover`} 
              alt="" 
              className="h-full w-full object-cover" 
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
          <div className="flex-1 min-w-0 space-y-4 text-center md:text-left">
            <div>
              <div className="inline-flex items-center gap-1 text-[10px] uppercase font-extrabold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                <Sparkles className="h-3 w-3" />
                Lectura Favorita Reciente
              </div>
              <h3 className="text-xl font-bold font-display text-[var(--color-text)] truncate mt-2">
                {spotlight.title}
              </h3>
              <p className="text-xs text-[var(--color-textSecondary)] mt-1 font-light truncate">
                {spotlight.author || 'Autor desconocido'}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <button
                onClick={() => onComicClick(spotlight)}
                className="px-5 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold hover:shadow-lg active:scale-95 transition-all flex items-center gap-1.5 hover-lift"
              >
                Comenzar Lectura
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => onToggleFavorite(spotlight.id, true)}
                className="px-4 py-2.5 rounded-xl border border-[var(--color-cardBorder)] text-xs text-[var(--color-text)] font-semibold hover:bg-[var(--color-background)] transition-all flex items-center gap-1.5"
              >
                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                Quitar de favoritos
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid view of all favorites */}
      <div>
        <h3 className="text-lg font-bold font-display text-[var(--color-text)] flex items-center gap-2 mb-4 px-1">
          <Star className="h-4.5 w-4.5 text-amber-500" />
          Todos tus Favoritos
        </h3>

        {favorites.length === 0 ? (
          <div className="text-center py-16 rounded-3xl border border-dashed border-[var(--color-cardBorder)] bg-[var(--color-surfaceAlpha)] flex flex-col items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center animate-bounce">
              <Heart className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-bold text-[var(--color-text)] font-display">Aún no tienes favoritos</h4>
            <p className="text-xs text-[var(--color-textSecondary)] font-light max-w-xs mx-auto">
              Presiona el icono de corazón en cualquier cómic de tu biblioteca para destacarlo aquí.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {favorites.map((c) => {
              const percent = c.pageCount && c.pageCount > 0 
                ? Math.round((c.currentPage || 0) / c.pageCount * 100)
                : 0;

              return (
                <div 
                  key={c.id} 
                  className="group relative flex flex-col rounded-2xl border border-[var(--color-cardBorder)] bg-[var(--color-surface)] overflow-hidden shadow-sm hover-lift cursor-pointer"
                  onClick={() => onComicClick(c)}
                >
                  {/* Cover */}
                  <div className="aspect-[2/3] w-full bg-slate-100 overflow-hidden relative border-b border-[var(--color-cardBorder)]">
                    <img 
                      src={`/api/comics/${c.id}/cover`} 
                      alt="" 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    
                    {/* Floating Heart */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(c.id, true);
                      }}
                      className="absolute top-2.5 right-2.5 h-8 w-8 rounded-full bg-black/45 border border-white/10 hover:bg-black/60 flex items-center justify-center transition-all text-white scale-90 group-hover:scale-100 z-10"
                    >
                      <Heart className="h-4.5 w-4.5 fill-red-500 text-red-500" />
                    </button>

                    {/* Progress overlay */}
                    {percent > 0 && (
                      <div className="absolute bottom-2 left-2 bg-black/65 border border-white/10 rounded-full px-2 py-0.5 text-[9px] font-bold text-white z-10 select-none">
                        {percent}% completado
                      </div>
                    )}
                  </div>

                  {/* Title details */}
                  <div className="p-3 min-w-0">
                    <span className="text-[8px] font-extrabold uppercase px-1 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      {c.format}
                    </span>
                    <h4 className="text-xs font-bold font-display text-[var(--color-text)] truncate mt-1.5 group-hover:text-[var(--color-primary)] transition-colors" title={c.title}>
                      {c.title}
                    </h4>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
