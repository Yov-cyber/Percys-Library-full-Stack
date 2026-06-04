import { useState, useRef, useEffect } from 'react';
import { Comic } from '../types';
import { Book, Heart, Clock, Play, Tag, Folder } from 'lucide-react';
import { cn } from '../utils/cn';

interface ComicCardProps {
  comic: Comic;
  onToggleFavorite: (id: string, currentStatus: boolean) => void;
  onUpdateCategory: (id: string, category: string | null) => void;
  onClick: (comic: Comic) => void;
}

export function ComicCard({ comic, onToggleFavorite, onUpdateCategory, onClick }: ComicCardProps) {
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const progress = comic.pageCount && comic.pageCount > 0 
    ? Math.round((comic.currentPage || 0) / comic.pageCount * 100)
    : 0;

  // New badge logic (if added less than 3 days ago)
  const isNew = new Date().getTime() - new Date(comic.addedAt).getTime() < 3 * 24 * 60 * 60 * 1000;

  // Format badge colors
  const getFormatBadgeClass = (format: string) => {
    switch (format?.toLowerCase()) {
      case 'cbz': return 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20';
      case 'cbr': return 'bg-teal-500/15 text-teal-500 border border-teal-500/20';
      case 'pdf': return 'bg-violet-500/15 text-violet-500 border border-violet-500/20';
      case 'folder': return 'bg-cyan-500/15 text-cyan-500 border border-cyan-500/20';
      default: return 'bg-slate-500/15 text-slate-500 border border-slate-500/20';
    }
  };

  // Close category dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowCategoryMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      onClick={() => onClick(comic)}
      className="group relative flex flex-col rounded-2xl border border-[var(--color-cardBorder)] bg-[var(--color-surface)] overflow-hidden shadow-sm hover-lift cursor-pointer select-none transition-all duration-300 hover:shadow-xl"
    >
      {/* Cover Image & Hover Overlay */}
      <div className="aspect-[2/3] overflow-hidden bg-gradient-to-br from-[var(--color-primary)]/10 to-[var(--color-secondary)]/10 relative border-b border-[var(--color-cardBorder)]">
        <img
          src={`/api/comics/${comic.id}/cover`}
          alt={comic.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:rotate-1"
          loading="lazy"
          onError={(e) => {
            // Replace with fallback icon on error
            (e.target as HTMLElement).style.display = 'none';
          }}
        />

        {/* Fallback Icon */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-10 scale-90 group-hover:scale-100 transition-all">
          <Book className="h-16 w-16 text-[var(--color-primary)]" />
        </div>

        {/* Badge: New */}
        {isNew && (
          <div className="absolute top-2.5 left-2.5 z-10 px-2.5 py-0.5 rounded-full bg-amber-500 text-white font-bold text-[9px] uppercase tracking-wider shadow-sm animate-pulse-glow">
            Nuevo
          </div>
        )}

        {/* Favorite Heart Trigger */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(comic.id, !!comic.isFavorite);
          }}
          className={cn(
            "absolute top-2.5 right-2.5 h-8.5 w-8.5 rounded-full border bg-black/45 border-white/10 hover:bg-black/60 flex items-center justify-center transition-all z-10",
            comic.isFavorite ? "scale-100 bg-amber-500 border-amber-600 hover:bg-amber-600" : "scale-90 opacity-0 group-hover:opacity-100 group-hover:scale-100"
          )}
          title={comic.isFavorite ? "Quitar de favoritos" : "Marcar como favorito"}
        >
          <Heart className={cn("h-4.5 w-4.5 text-white transition-transform hover:scale-125", comic.isFavorite ? "fill-current" : "")} />
        </button>

        {/* Hover overlay quick buttons */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-secondary)]/80 via-[var(--color-secondary)]/40 to-transparent backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 gap-2 z-10">
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClick(comic);
              }}
              className="flex-1 py-2 rounded-xl bg-[var(--color-primary)] hover:bg-[var(--color-secondary)] text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md active:scale-95 hover:scale-105"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Leer ahora
            </button>
            
            {/* Category tag icon */}
            <div ref={menuRef} className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCategoryMenu(!showCategoryMenu);
                }}
                className="h-8.5 w-8.5 rounded-xl bg-white/10 border border-white/15 hover:bg-white/20 text-white flex items-center justify-center transition-all hover:scale-110"
                title="Cambiar Categoría"
              >
                <Tag className="h-4 w-4" />
              </button>
              
              {showCategoryMenu && (
                <div className="absolute bottom-full right-0 mb-2 w-44 rounded-xl bg-[var(--color-surface)] border border-[var(--color-cardBorder)] shadow-lg p-1.5 z-20 stagger-in">
                  <p className="text-[9px] font-bold text-[var(--color-textSecondary)] uppercase tracking-wider px-2 py-1 border-b border-[var(--color-cardBorder)]">Asignar Categoría</p>
                  <div className="max-h-32 overflow-y-auto space-y-0.5 mt-1">
                    {['Marvel', 'DC Cómics', 'Manga', 'Libros', 'Novelas', 'Otros'].map((cat) => (
                      <button
                        key={cat}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateCategory(comic.id, cat);
                          setShowCategoryMenu(false);
                        }}
                        className={cn(
                          "w-full text-left px-2.5 py-1.5 text-2xs font-semibold rounded-lg hover:bg-[var(--color-background)] transition-all",
                          comic.category === cat ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10 font-bold" : "text-[var(--color-text)]"
                        )}
                      >
                        {cat}
                      </button>
                    ))}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateCategory(comic.id, null);
                        setShowCategoryMenu(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 text-2xs font-bold text-red-500 rounded-lg hover:bg-red-500/15 transition-all mt-1"
                    >
                      Quitar categoría
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Info Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Format and category tags row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={cn("text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-full font-display tracking-wider", getFormatBadgeClass(comic.format))}>
              {comic.format}
            </span>
            {comic.category && (
              <span className="text-[8px] font-extrabold text-[var(--color-textSecondary)] bg-[var(--color-border)]/65 border border-[var(--color-cardBorder)] px-1.5 py-0.5 rounded-full max-w-[80px] truncate">
                {comic.category}
              </span>
            )}
          </div>

          <h3 className="text-xs font-bold font-display text-[var(--color-text)] leading-snug truncate mt-2 group-hover:text-[var(--color-primary)] transition-colors" title={comic.title}>
            {comic.title}
          </h3>
          {comic.author && (
            <p className="text-[10px] text-[var(--color-textSecondary)] font-light mt-0.5 truncate">
              {comic.author}
            </p>
          )}
        </div>

        {/* Progress bar under info */}
        {progress > 0 && (
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-[9px] text-[var(--color-textSecondary)] font-semibold">
              <span className="flex items-center gap-0.5">
                <Clock className="h-3 w-3 text-[var(--color-primary)]" />
                {progress}% leído
              </span>
              <span>{comic.currentPage}/{comic.pageCount} pgs</span>
            </div>
            <div className="h-1 w-full bg-[var(--color-border)] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] rounded-full transition-all duration-500 group-hover:shadow-lg" 
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
