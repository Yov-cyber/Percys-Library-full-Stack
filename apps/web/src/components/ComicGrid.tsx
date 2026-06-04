import { Comic } from '../types';
import { ComicCard } from './ComicCard';
import { ComicCover } from './ComicCover';
import { BookOpen, Heart, Upload, FolderSync, FilterX } from 'lucide-react';
import { cn } from '../utils/cn';

interface ComicGridProps {
  comics: Comic[];
  onToggleFavorite: (id: string, currentStatus: boolean) => void;
  onUpdateCategory: (id: string, category: string | null) => void;
  onComicClick: (comic: Comic) => void;
  loading?: boolean;
  viewMode?: 'grid' | 'list';
  hasFilters?: boolean;
  onImport?: () => void;
  onScan?: () => void;
}

export function ComicGrid({ 
  comics, 
  onToggleFavorite, 
  onUpdateCategory,
  onComicClick, 
  loading,
  viewMode = 'grid',
  hasFilters,
  onImport,
  onScan,
}: ComicGridProps) {

  if (loading) {
    return (
      <div className={cn(
        viewMode === 'grid' 
          ? "grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
          : "space-y-3"
      )}>
        {[...Array(8)].map((_, i) => (
          viewMode === 'grid' ? (
            <div
              key={i}
              className="aspect-[2/3] animate-shimmer rounded-2xl border border-[var(--color-cardBorder)] bg-[var(--color-surface)]"
            />
          ) : (
            <div 
              key={i} 
              className="h-20 animate-shimmer rounded-2xl border border-[var(--color-cardBorder)] bg-[var(--color-surface)] w-full"
            />
          )
        ))}
      </div>
    );
  }

  if (comics.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 md:py-24 text-center rounded-3xl border border-dashed border-[var(--color-cardBorder)] bg-[var(--color-surfaceAlpha)] px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--color-primary)_0%,transparent_65%)] opacity-[0.06] pointer-events-none" />
        <div className="relative">
          <div className="mb-5 rounded-full bg-[var(--color-primary)]/10 p-6 text-[var(--color-primary)] animate-float inline-flex">
            {hasFilters ? <FilterX className="h-10 w-10" /> : <BookOpen className="h-10 w-10" />}
          </div>
          <h3 className="mb-2 text-lg font-bold text-[var(--color-text)] font-display">
            {hasFilters ? 'Ningún cómic coincide' : 'Tu biblioteca te espera'}
          </h3>
          <p className="text-sm text-[var(--color-textSecondary)] font-light max-w-md mx-auto leading-relaxed">
            {hasFilters
              ? 'Prueba ajustando los filtros de estado o formato para encontrar lo que buscas.'
              : 'Importa tus primeros cómics en CBZ, CBR o PDF, o escanea una carpeta local para empezar tu colección.'}
          </p>
          {!hasFilters && onImport && onScan && (
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={onImport}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white active:scale-95 transition-all shadow-md"
                style={{ background: 'var(--color-gradient)' }}
              >
                <Upload className="h-4 w-4" />
                Importar cómics
              </button>
              <button
                onClick={onScan}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-[var(--color-cardBorder)] text-sm font-bold text-[var(--color-text)] hover:bg-[var(--color-background)] transition-all"
              >
                <FolderSync className="h-4 w-4 text-[var(--color-primary)]" />
                Escanear carpeta
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-3 stagger-in">
        {comics.map((c) => {
          const percent = c.pageCount > 0 ? Math.round((c.currentPage / c.pageCount) * 100) : 0;
          return (
            <div
              key={c.id}
              onClick={() => onComicClick(c)}
              className="w-full text-left p-3.5 rounded-2xl border border-[var(--color-cardBorder)] bg-[var(--color-surface)] hover-lift flex gap-4 items-center justify-between cursor-pointer select-none group"
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* mini cover */}
                <ComicCover comicId={c.id} title={c.title} className="h-14 w-9.5 rounded-lg flex-shrink-0 shadow-sm border border-[var(--color-cardBorder)]" />
                
                <div className="min-w-0">
                  <h4 className="text-sm font-bold text-[var(--color-text)] font-display truncate group-hover:text-[var(--color-primary)] transition-colors">
                    {c.title}
                  </h4>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      {c.format}
                    </span>
                    {c.category && (
                      <span className="text-[9px] font-bold text-[var(--color-textSecondary)] bg-[var(--color-border)]/50 px-1.5 py-0.5 rounded">
                        {c.category}
                      </span>
                    )}
                    {c.author && (
                      <span className="text-[10px] text-[var(--color-textSecondary)] font-light">
                        por {c.author}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* right actions/progress */}
              <div className="flex items-center gap-6 flex-shrink-0">
                {percent > 0 && (
                  <div className="hidden sm:flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-[var(--color-text)] font-display">{percent}% leído</span>
                    <span className="text-[9px] text-[var(--color-textSecondary)]">{c.currentPage} de {c.pageCount} págs</span>
                  </div>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(c.id, c.isFavorite);
                  }}
                  className={cn(
                    "h-8 w-8 rounded-full border flex items-center justify-center transition-all bg-[var(--color-background)] hover:bg-[var(--color-border)] min-h-[44px] min-w-[44px]",
                    c.isFavorite ? "border-amber-400 text-amber-500 bg-amber-50" : "border-[var(--color-cardBorder)] text-[var(--color-textSecondary)]"
                  )}
                  aria-label={c.isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}
                >
                  <Heart className={cn("h-4 w-4", c.isFavorite ? "fill-current" : "")} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 stagger-in">
      {comics.map((comic) => (
        <ComicCard
          key={comic.id}
          comic={comic}
          onToggleFavorite={onToggleFavorite}
          onUpdateCategory={onUpdateCategory}
          onClick={onComicClick}
        />
      ))}
    </div>
  );
}
