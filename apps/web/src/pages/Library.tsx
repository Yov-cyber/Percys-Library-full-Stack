import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/sidebar/Sidebar';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { Footer } from '../components/Footer';
import { OnboardingModal } from '../components/OnboardingModal';
import { ErrorBanner } from '../components/ui/ErrorBanner';
import { Dashboard } from '../components/dashboard/Dashboard';
import { StatsView } from '../components/stats/StatsView';
import { AchievementsGrid } from '../components/achievements/AchievementsGrid';
import { CategoriesView } from '../components/categories/CategoriesView';
import { FavoritesView } from '../components/favorites/FavoritesView';
import { ComicGrid } from '../components/ComicGrid';
import { UploadModal } from '../components/UploadModal';
import { useComics } from '../hooks/useComics';
import { useAchievements } from '../hooks/useAchievements';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { useToast } from '../hooks/useToast';
import { 
  Grid, 
  List, 
  ChevronDown, 
  RefreshCw,
  Info
} from 'lucide-react';
import { cn } from '../utils/cn';
import { Comic } from '../types';

const SECTION_TITLES: Record<string, { title: string; description: string }> = {
  dashboard: { title: 'Inicio', description: 'Tu panel personal de lectura con estadísticas y novedades.' },
  library: { title: 'Biblioteca', description: 'Explora y organiza toda tu colección de cómics.' },
  categories: { title: 'Categorías', description: 'Organiza tus cómics por género y colección.' },
  favorites: { title: 'Favoritos', description: 'Tus historias preferidas en un solo lugar.' },
  stats: { title: 'Estadísticas', description: 'Métricas detalladas de tu actividad de lectura.' },
  achievements: { title: 'Logros', description: 'Desafíos y medallas por tu progreso.' },
  settings: { title: 'Ajustes', description: 'Configuración y sincronización de biblioteca.' },
};

export function Library() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dismissedError, setDismissedError] = useState(false);

  const sectionMeta = SECTION_TITLES[activeSection] ?? SECTION_TITLES.dashboard;
  useDocumentTitle(sectionMeta.title, sectionMeta.description);

  const { 
    comics, 
    loading, 
    error,
    filters, 
    setFilters, 
    addComic, 
    toggleFavorite, 
    updateCategory,
    getRandomComic,
    refetch 
  } = useComics();

  const { achievements, loading: achievementsLoading, error: achievementsError, refetch: refetchAchievements } = useAchievements();

  // Surprise me random pick action
  const handleSurpriseMe = async () => {
    const picked = await getRandomComic();
    if (picked) {
      navigate(`/reader/${picked.id}`);
    }
  };

  const handleComicClick = (comic: Comic) => {
    navigate(`/reader/${comic.id}`);
  };

  const handleScanLibrary = useCallback(async () => {
    try {
      setScanning(true);
      const response = await fetch('/api/library/scan', { method: 'POST' });
      if (response.ok) {
        await refetch();
        await refetchAchievements();
        toast('Biblioteca sincronizada correctamente', 'success');
      } else {
        toast('No se pudo sincronizar la biblioteca', 'error');
      }
    } catch {
      toast('Error de conexión al escanear', 'error');
    } finally {
      setScanning(false);
    }
  }, [refetch, refetchAchievements, toast]);

  useEffect(() => {
    if (error) setDismissedError(false);
  }, [error]);

  // Status mapping filter keys
  const statusChips = [
    { label: 'Todos', value: 'all' },
    { label: 'Sin leer', value: 'unread' },
    { label: 'En progreso', value: 'in-progress' },
    { label: 'Completados', value: 'completed' },
  ] as const;

  // Format mapping
  const formatChips = [
    { label: 'Formatos', value: '' },
    { label: 'CBZ', value: 'cbz' },
    { label: 'CBR', value: 'cbr' },
    { label: 'PDF', value: 'pdf' },
    { label: 'Carpetas', value: 'folder' },
  ] as const;

  const sortOptions = [
    { label: 'Recientes', value: 'updatedAt' },
    { label: 'Título', value: 'title' },
    { label: 'Fecha de subida', value: 'addedAt' },
    { label: 'Última lectura', value: 'lastReadAt' },
  ] as const;

  // Render matching main panels
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return (
          <Dashboard 
            onNavigate={setActiveSection} 
            comics={comics}
            onComicClick={handleComicClick}
            onSurpriseMe={handleSurpriseMe}
          />
        );
      
      case 'library':
        return (
          <div className="space-y-6 stagger-in">
            {/* Library Page Head */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-1">
              <div>
                <h2 className="text-2xl font-bold text-[var(--color-text)] font-display">Mi Biblioteca</h2>
                <p className="text-xs text-[var(--color-textSecondary)] font-light mt-0.5">
                  {comics.length} {comics.length === 1 ? 'cómic catalogado' : 'cómics catalogados'}
                </p>
              </div>

              {/* View control actions */}
              <div className="flex items-center gap-3">
                {/* View toggles */}
                <div className="flex rounded-xl border border-[var(--color-cardBorder)] bg-[var(--color-surfaceAlpha)] p-1">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={cn("p-1.5 rounded-lg text-[var(--color-textSecondary)]", viewMode === 'grid' ? "bg-[var(--color-primary)] text-white" : "")}
                  >
                    <Grid className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={cn("p-1.5 rounded-lg text-[var(--color-textSecondary)]", viewMode === 'list' ? "bg-[var(--color-primary)] text-white" : "")}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>

                {/* Sort Option Trigger Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--color-cardBorder)] bg-[var(--color-surfaceAlpha)] text-xs font-semibold text-[var(--color-text)]"
                  >
                    <span>Ordenar por: {sortOptions.find(o => o.value === filters.sort)?.label}</span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </button>

                  {showSortDropdown && (
                    <div className="absolute right-0 mt-2 w-44 rounded-xl bg-[var(--color-surface)] border border-[var(--color-cardBorder)] shadow-lg p-1.5 z-20">
                      {sortOptions.map((o) => (
                        <button
                          key={o.value}
                          onClick={() => {
                            setFilters(prev => ({ ...prev, sort: o.value }));
                            setShowSortDropdown(false);
                          }}
                          className={cn(
                            "w-full text-left px-2.5 py-1.5 text-xs font-medium rounded-lg hover:bg-[var(--color-background)] transition-all",
                            filters.sort === o.value ? "text-[var(--color-primary)] bg-[var(--color-primary)]/10 font-bold" : "text-[var(--color-text)]"
                          )}
                        >
                          {o.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Toolbars */}
            <div className="rounded-2xl border border-[var(--color-cardBorder)] bg-[var(--color-surfaceAlpha)] p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              {/* Status filter chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                {statusChips.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => setFilters(prev => ({ ...prev, status: c.value }))}
                    className={cn(
                      "px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95",
                      filters.status === c.value
                        ? "bg-[var(--color-primary)] text-white shadow-sm"
                        : "bg-[var(--color-background)] text-[var(--color-textSecondary)] border border-[var(--color-cardBorder)] hover:text-[var(--color-text)]"
                    )}
                  >
                    {c.label}
                  </button>
                ))}
              </div>

              {/* Format selection chips */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[10px] font-extrabold uppercase text-[var(--color-textSecondary)] tracking-wider mr-1">Formatos:</span>
                {formatChips.map((f) => {
                  const isActive = (filters.format || '') === f.value;
                  return (
                    <button
                      key={f.value}
                      onClick={() => setFilters(prev => ({ ...prev, format: f.value }))}
                      className={cn(
                        "px-3 py-1 rounded-lg text-xs font-semibold transition-all",
                        isActive
                          ? "bg-[var(--color-primary)]/15 text-[var(--color-primary)] border border-[var(--color-primary)]/20 font-bold"
                          : "text-[var(--color-textSecondary)] hover:text-[var(--color-text)] bg-[var(--color-background)] border border-[var(--color-cardBorder)]"
                      )}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Main comic grid display */}
            <ComicGrid 
              comics={comics}
              onToggleFavorite={toggleFavorite}
              onUpdateCategory={updateCategory}
              onComicClick={handleComicClick}
              loading={loading}
              viewMode={viewMode}
              hasFilters={filters.status !== 'all' || !!filters.format || !!filters.category}
              onImport={() => setIsUploadModalOpen(true)}
              onScan={handleScanLibrary}
            />
          </div>
        );

      case 'categories':
        return (
          <CategoriesView 
            comics={comics}
            onSelectCategory={(cat) => {
              setFilters(prev => ({ ...prev, category: cat }));
              setActiveSection('library');
            }}
            onUpdateComicCategory={updateCategory}
          />
        );

      case 'favorites':
        return (
          <FavoritesView 
            comics={comics}
            onComicClick={handleComicClick}
            onToggleFavorite={toggleFavorite}
          />
        );

      case 'stats':
        return (
          <StatsView 
            onComicClick={(comicId) => {
              const c = comics.find(x => x.id === comicId);
              if (c) handleComicClick(c);
            }}
          />
        );

      case 'achievements':
        return (
          <AchievementsGrid 
            achievements={achievements}
            loading={achievementsLoading}
            error={achievementsError}
            onRetry={refetchAchievements}
          />
        );

      case 'settings':
        return (
          <div className="space-y-6 max-w-2xl mx-auto stagger-in pb-12">
            <div className="px-1">
              <h2 className="text-2xl font-bold text-[var(--color-text)] font-display">Configuración</h2>
              <p className="text-xs text-[var(--color-textSecondary)] font-light mt-0.5 font-display">Ajustes generales del portal de lectura</p>
            </div>

            <div className="rounded-3xl border border-[var(--color-cardBorder)] bg-[var(--color-surfaceAlpha)] p-6 space-y-6 shadow-md">
              {/* Scan library card */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-[var(--color-cardBorder)]">
                <div>
                  <h3 className="text-sm font-bold text-[var(--color-text)] font-display">Sincronizar Directorio</h3>
                  <p className="text-xs text-[var(--color-textSecondary)] mt-1 font-light">Escanear el directorio local en búsqueda de nuevos archivos importados manualmente.</p>
                </div>
                <button
                  onClick={handleScanLibrary}
                  disabled={scanning}
                  className="px-4 py-2.5 rounded-xl bg-[var(--color-primary)] text-white text-xs font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <RefreshCw className={cn("h-4 w-4", scanning ? "animate-spin" : "")} />
                  <span>{scanning ? 'Sincronizando...' : 'Escanear ahora'}</span>
                </button>
              </div>

              {/* Version info card */}
              <div className="flex gap-3 items-start bg-[var(--color-background)] p-4 rounded-2xl border border-[var(--color-cardBorder)]">
                <Info className="h-5 w-5 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                <div className="text-xs text-[var(--color-textSecondary)] leading-relaxed">
                  <p className="font-bold text-[var(--color-text)]">Percy's Library v1.5.0</p>
                  <p className="mt-1 font-light">Este portal está conectado a una base de datos SQLite y soporta cargas optimizadas de cómics en formatos archivadores. Diseñado con interfaz premium glassmorphism y racha de lectura automatizada.</p>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--color-background)] text-[var(--color-text)]">
      <Sidebar 
        currentSection={activeSection} 
        onSectionChange={setActiveSection}
        comics={comics}
        onSurpriseMe={handleSurpriseMe}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 lg:pl-72 transition-all duration-300 pb-20 md:pb-0">
        <Header 
          onUploadClick={() => setIsUploadModalOpen(true)}
          onMenuClick={() => setMobileMenuOpen(true)}
          title={sectionMeta.title}
          subtitle={sectionMeta.description}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">
          {error && !dismissedError && (
            <ErrorBanner
              message={error}
              onRetry={() => { setDismissedError(false); refetch(); }}
              onDismiss={() => setDismissedError(true)}
            />
          )}
          {renderActiveSection()}
        </main>

        <Footer />
      </div>

      <MobileBottomNav currentSection={activeSection} onSectionChange={setActiveSection} />

      <OnboardingModal
        comicCount={comics.length}
        onImport={() => setIsUploadModalOpen(true)}
        onScan={handleScanLibrary}
      />

      <UploadModal 
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUpload={addComic}
      />
    </div>
  );
}
