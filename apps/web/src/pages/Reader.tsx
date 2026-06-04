import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, Hash } from 'lucide-react';
import { Comic } from '../types';
import { cn } from '../utils/cn';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useToast } from '../hooks/useToast';

export function Reader() {
  const { comicId } = useParams<{ comicId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [comic, setComic] = useState<Comic | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPageJump, setShowPageJump] = useState(false);
  const [pageInput, setPageInput] = useState('');
  const touchStartX = useRef<number | null>(null);

  useDocumentTitle(comic ? `Leyendo: ${comic.title}` : 'Lector');

  useEffect(() => {
    if (!comicId) return;

    async function fetchComic() {
      try {
        setLoading(true);
        const res = await fetch(`/api/comics/${comicId}`);
        if (!res.ok) throw new Error('No se pudo cargar el cómic');
        const data = await res.json();
        setComic(data);
        setCurrentPage(data.currentPage || 0);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar');
      } finally {
        setLoading(false);
      }
    }

    fetchComic();
  }, [comicId]);

  const saveProgress = useCallback(async (page: number) => {
    if (!comicId || !comic) return;
    try {
      const isLastPage = comic.pageCount > 0 && page >= comic.pageCount - 1;
      await fetch(`/api/comics/${comicId}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page, completed: isLastPage }),
      });
      if (isLastPage) toast('¡Cómic completado!', 'success');
    } catch {
      toast('No se pudo guardar el progreso', 'warning');
    }
  }, [comicId, comic, toast]);

  const goToPage = useCallback((page: number) => {
    if (!comic) return;
    const clamped = Math.max(0, Math.min(page, comic.pageCount - 1));
    setCurrentPage(clamped);
    saveProgress(clamped);
  }, [comic, saveProgress]);

  const handlePrevious = useCallback(() => {
    if (currentPage > 0) goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  const handleNext = useCallback(() => {
    if (comic && currentPage < comic.pageCount - 1) goToPage(currentPage + 1);
  }, [currentPage, comic, goToPage]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (showPageJump) return;
      if (e.key === 'ArrowLeft') handlePrevious();
      else if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); handleNext(); }
      else if (e.key === 'Escape') {
        if (isFullscreen) setIsFullscreen(false);
        else setShowPageJump(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevious, handleNext, isFullscreen, showPageJump]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 60) {
      if (diff > 0) handlePrevious();
      else handleNext();
    }
    touchStartX.current = null;
  };

  const handlePageJump = () => {
    const num = parseInt(pageInput, 10);
    if (!isNaN(num) && comic) {
      goToPage(num - 1);
      setShowPageJump(false);
      setPageInput('');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false));
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-[var(--color-reader-bg)] flex flex-col items-center justify-center text-white gap-3 safe-top safe-bottom">
        <div className="h-8 w-8 rounded-full border-4 border-[var(--color-primary)] border-t-transparent animate-spin" />
        <span className="text-xs text-[var(--color-primary)] font-display">Cargando visor...</span>
      </div>
    );
  }

  if (error || !comic) {
    return (
      <div className="fixed inset-0 bg-[var(--color-reader-bg)] flex flex-col items-center justify-center text-white p-6 gap-4">
        <p className="text-red-400 font-display text-sm">{error || 'Comic no encontrado'}</p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 rounded-xl text-xs font-bold text-white transition-all active:scale-95"
          style={{ background: 'var(--color-gradient)' }}
        >
          Volver a la Biblioteca
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-[var(--color-reader-bg)] flex flex-col select-none overflow-hidden safe-top safe-bottom">
      <div
        className={cn(
          'absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-[var(--color-reader-overlay)] to-transparent px-4 md:px-6 py-4 transition-all duration-300 flex justify-between items-center',
          showControls ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0 pointer-events-none'
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <button
            className="flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 px-3 md:px-4 py-2.5 text-xs text-white transition-all active:scale-95 min-h-[44px]"
            onClick={() => navigate('/')}
            aria-label="Volver a biblioteca"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Biblioteca</span>
          </button>
          <div className="min-w-0">
            <h1 className="text-xs md:text-sm font-bold text-white font-display truncate max-w-[40vw] md:max-w-sm">
              {comic.title}
            </h1>
            <p className="text-[10px] text-white/60 mt-0.5 uppercase tracking-wider font-extrabold">
              {comic.format} • {currentPage + 1}/{comic.pageCount}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => { setShowPageJump(true); setPageInput(String(currentPage + 1)); }}
            className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 p-2.5 text-white transition-all active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Ir a página"
          >
            <Hash className="h-4 w-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 p-2.5 text-white transition-all active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div
        className="flex-1 flex items-center justify-center relative bg-[var(--color-reader-bg)] p-2 h-full w-full touch-pan-y"
        onClick={() => setShowControls(!showControls)}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="max-w-full max-h-full flex items-center justify-center relative z-10">
          <img
            src={`/api/comics/${comicId}/pages/${currentPage}`}
            alt={`Página ${currentPage + 1} de ${comic.title}`}
            className="max-w-full max-h-[85vh] md:max-h-[92vh] object-contain shadow-2xl rounded-sm border border-white/10 pointer-events-none"
            loading="eager"
          />
        </div>
        <div className="absolute inset-y-0 left-0 w-1/5 z-10 hidden md:block cursor-w-resize" onClick={(e) => { e.stopPropagation(); handlePrevious(); }} aria-hidden="true" />
        <div className="absolute inset-y-0 right-0 w-1/5 z-10 hidden md:block cursor-e-resize" onClick={(e) => { e.stopPropagation(); handleNext(); }} aria-hidden="true" />
      </div>

      <div
        className={cn(
          'absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[var(--color-reader-overlay)] to-transparent px-4 md:px-6 py-4 md:py-6 transition-all duration-300',
          showControls ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
        )}
      >
        <div className="flex items-center justify-between max-w-2xl mx-auto gap-3">
          <button
            onClick={handlePrevious}
            disabled={currentPage === 0}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 px-3 md:px-4 py-2.5 text-xs text-white transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 min-h-[44px]"
            aria-label="Página anterior"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Anterior</span>
          </button>

          <div className="text-white text-center flex-1">
            <button
              onClick={() => { setShowPageJump(true); setPageInput(String(currentPage + 1)); }}
              className="text-sm font-bold font-display hover:text-[var(--color-primary)] transition-colors"
            >
              {currentPage + 1} / {comic.pageCount}
            </button>
            <div className="w-32 sm:w-60 h-1.5 bg-white/20 rounded-full mt-2 mx-auto overflow-hidden">
              <div
                className="h-full bg-[var(--color-primary)] rounded-full transition-all duration-300"
                style={{ width: `${((currentPage + 1) / comic.pageCount) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage === comic.pageCount - 1}
            className="flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 px-3 md:px-4 py-2.5 text-xs text-white transition-all disabled:opacity-30 disabled:pointer-events-none active:scale-95 min-h-[44px]"
            aria-label="Página siguiente"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showPageJump && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true" aria-label="Ir a página">
          <div className="w-full max-w-xs rounded-2xl bg-[var(--color-surface)] border border-[var(--color-cardBorder)] p-6 shadow-2xl animate-scale-in">
            <h3 className="text-sm font-bold text-[var(--color-text)] font-display mb-3">Ir a página</h3>
            <input
              type="number"
              min={1}
              max={comic.pageCount}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePageJump()}
              className="w-full rounded-xl border border-[var(--color-cardBorder)] bg-[var(--color-background)] px-4 py-3 text-sm text-[var(--color-text)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/10"
              autoFocus
            />
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setShowPageJump(false)}
                className="flex-1 py-2.5 rounded-xl border border-[var(--color-cardBorder)] text-xs font-bold text-[var(--color-text)]"
              >
                Cancelar
              </button>
              <button
                onClick={handlePageJump}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white"
                style={{ background: 'var(--color-gradient)' }}
              >
                Ir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reader;
