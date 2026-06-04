import { useState, useRef, useEffect } from 'react';
import { Search, Upload, ArrowRight, X, Menu } from 'lucide-react';
import { useSearch } from '../hooks/useSearch';
import { ThemeSwitcher } from './ThemeSwitcher';
import { ComicCover } from './ComicCover';
import { useNavigate } from 'react-router-dom';
import { cn } from '../utils/cn';

interface HeaderProps {
  onUploadClick: () => void;
  onMenuClick?: () => void;
  title?: string;
  subtitle?: string;
}

export function Header({ onUploadClick, onMenuClick, title = "Percy's Library", subtitle = "Tu portal de lectura" }: HeaderProps) {
  const { query, setQuery, results, loading, tookMs, error: searchError } = useSearch();
  const [showResults, setShowResults] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setShowResults(false);
        setMobileSearchOpen(false);
      }
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  const handleResultClick = (comicId: string) => {
    setShowResults(false);
    setMobileSearchOpen(false);
    setQuery('');
    navigate(`/reader/${comicId}`);
  };

  const searchInput = (
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-textSecondary)]" aria-hidden="true" />
      <input
        type="search"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowResults(true);
        }}
        onFocus={() => setShowResults(true)}
        placeholder="Buscar cómics..."
        className="w-full rounded-xl border border-[var(--color-cardBorder)] bg-[var(--color-background)]/60 py-2.5 pl-10 pr-10 text-sm text-[var(--color-text)] placeholder-[var(--color-textSecondary)] focus:border-[var(--color-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--color-primary)]/10 transition-all font-display focus:shadow-lg"
        aria-label="Buscar cómics"
        aria-autocomplete="list"
        aria-expanded={showResults && query.trim().length > 0}
      />
      {query && (
        <button
          onClick={() => { setQuery(''); setShowResults(false); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)] hover:text-[var(--color-text)]"
          aria-label="Limpiar búsqueda"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  const searchResults = showResults && query.trim().length > 0 && (
    <div
      className="absolute top-full left-0 right-0 mt-2 rounded-2xl glass-card overflow-hidden shadow-xl z-50 border border-[var(--color-cardBorder)] animate-slide-up"
      role="listbox"
    >
      <div className="p-3 border-b border-[var(--color-cardBorder)] flex justify-between items-center text-[10px] font-bold text-[var(--color-textSecondary)] uppercase tracking-wider bg-[var(--color-background)]/50">
        <span>Resultados</span>
        <span>{results.length} {tookMs > 0 && `(${tookMs}ms)`}</span>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-6 text-center text-sm text-[var(--color-textSecondary)] flex flex-col items-center gap-2">
            <div className="h-5 w-5 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin" />
            <span>Buscando...</span>
          </div>
        ) : searchError ? (
          <div className="p-6 text-center text-sm text-red-500">{searchError}</div>
        ) : results.length === 0 ? (
          <div className="p-8 text-center text-sm text-[var(--color-textSecondary)]">Sin resultados</div>
        ) : (
          <ul className="divide-y divide-[var(--color-cardBorder)]">
            {results.map((c) => {
              const percent = c.pageCount > 0 ? Math.round((c.currentPage || 0) / c.pageCount * 100) : 0;
              return (
                <li key={c.id} role="option">
                  <button
                    onClick={() => handleResultClick(c.id)}
                    className="w-full text-left p-3 hover:bg-[var(--color-background)]/80 flex gap-3 items-center transition-all group min-h-[44px] hover:scale-[1.02]"
                  >
                    <ComicCover comicId={c.id} title={c.title} className="h-12 w-8 rounded-md flex-shrink-0 shadow-sm border border-[var(--color-cardBorder)] group-hover:scale-110 transition-transform" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-[var(--color-text)] truncate group-hover:text-[var(--color-primary)] font-display">{c.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded bg-[var(--color-primary)]/10 text-[var(--color-primary)]">{c.format}</span>
                        {percent > 0 && <span className="text-[10px] text-[var(--color-textSecondary)]">{percent}%</span>}
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 text-[var(--color-primary)] transition-all group-hover:translate-x-1" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[var(--color-cardBorder)] bg-[var(--color-surfaceAlpha)] backdrop-blur-md safe-top transition-all duration-300">
      <div className="px-4 md:px-6 py-3 md:py-4 max-w-7xl mx-auto space-y-3">
        {/* Top row */}
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden rounded-xl p-2.5 border border-[var(--color-cardBorder)] text-[var(--color-text)] hover:bg-[var(--color-background)] transition-all min-h-[44px] min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95"
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          <div className="flex-1 min-w-0">
            <h2 className="text-lg md:text-xl font-bold text-[var(--color-text)] font-display tracking-tight truncate">{title}</h2>
            <p className="text-[10px] md:text-xs text-[var(--color-textSecondary)] font-light truncate hidden sm:block">{subtitle}</p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              className="md:hidden rounded-xl p-2.5 border border-[var(--color-cardBorder)] text-[var(--color-textSecondary)] hover:text-[var(--color-text)] min-h-[44px] min-w-[44px] flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
              aria-label="Buscar"
              aria-expanded={mobileSearchOpen}
            >
              <Search className="h-5 w-5" />
            </button>
            <ThemeSwitcher />
            <button
              onClick={onUploadClick}
              className="flex items-center gap-1.5 rounded-xl px-3 md:px-4 py-2.5 text-xs font-bold text-white transition-all shadow-md active:scale-95 min-h-[44px] glow-btn hover:scale-105"
              style={{ background: 'var(--color-gradient)' }}
              aria-label="Importar cómics"
            >
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Importar</span>
            </button>
          </div>
        </div>

        {/* Desktop search */}
        <div ref={searchRef} className={cn('relative max-w-lg hidden md:block', mobileSearchOpen && 'block md:block')}>
          {searchInput}
          {searchResults}
        </div>

        {/* Mobile search expand */}
        {mobileSearchOpen && (
          <div ref={searchRef} className="md:hidden relative animate-slide-up">
            {searchInput}
            {searchResults}
          </div>
        )}
      </div>
    </header>
  );
}
