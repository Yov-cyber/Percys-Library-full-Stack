import { useState } from 'react';
import { Tag, Plus, BookOpen, Layers, X, Trash2, ArrowRight } from 'lucide-react';
import { Comic } from '../../types';
import { cn } from '../../utils/cn';

interface CategoriesViewProps {
  comics: Comic[];
  onSelectCategory: (category: string) => void;
  onUpdateComicCategory: (comicId: string, category: string | null) => Promise<void>;
}

export function CategoriesView({ comics, onSelectCategory, onUpdateComicCategory }: CategoriesViewProps) {
  const [newCatName, setNewCatName] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // Group comics by category
  const categoriesMap = new Map<string, Comic[]>();
  
  comics.forEach((c) => {
    // Check primary category or legacy
    const cat = c.category && c.category.trim() ? c.category.trim() : 'Sin categoría';
    if (!categoriesMap.has(cat)) {
      categoriesMap.set(cat, []);
    }
    categoriesMap.get(cat)!.push(c);
  });

  const categories = Array.from(categoriesMap.entries()).map(([name, list]) => ({
    name,
    count: list.length,
    comics: list
  })).sort((a, b) => {
    if (a.name === 'Sin categoría') return 1;
    if (b.name === 'Sin categoría') return -1;
    return b.count - a.count;
  });

  // Calculate HSL gradients based on name hash
  const getGradient = (name: string) => {
    if (name === 'Sin categoría') {
      return 'linear-gradient(135deg, #475569 0%, #1e293b 100%)';
    }
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `linear-gradient(135deg, hsl(${hue}, 65%, 45%) 0%, hsl(${(hue + 45) % 360}, 75%, 32%) 100%)`;
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    
    // Assigning the category to nothing initially, or we can just keep category name in UI
    // By assigning it to one or more selected comics or letting the backend know.
    // The user can assign comics to this category.
    setIsAdding(false);
    setNewCatName('');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto stagger-in pb-12">
      {/* Title area */}
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-text)] font-display">Categorías</h2>
          <p className="text-xs text-[var(--color-textSecondary)] font-light mt-0.5">Organiza y agrupa tus cómics</p>
        </div>
      </div>

      {/* Grid of Categories (Mosaic) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => {
          const gradient = getGradient(cat.name);
          const topComics = cat.comics.slice(0, 3);
          
          return (
            <div 
              key={cat.name}
              className="rounded-3xl overflow-hidden shadow-lg border border-[var(--color-cardBorder)] bg-[var(--color-surface)] flex flex-col justify-between h-72 hover-lift group"
            >
              {/* Top Banner (Mosaic Background) */}
              <div 
                className="h-44 p-6 relative flex justify-between items-start text-white overflow-hidden"
                style={{ background: gradient }}
              >
                {/* Decorative overlay background */}
                <div className="absolute inset-0 bg-black/10 mix-blend-overlay pointer-events-none" />
                
                <div className="relative z-10 space-y-1 max-w-[60%]">
                  <h3 className="text-xl font-bold font-display truncate text-white" title={cat.name}>
                    {cat.name}
                  </h3>
                  <span className="inline-block text-[10px] px-2 py-0.5 rounded-full bg-white/20 border border-white/10 font-bold uppercase tracking-wider">
                    {cat.count} {cat.count === 1 ? 'ejemplar' : 'ejemplares'}
                  </span>
                </div>

                {/* Layered Collage of first 3 covers */}
                <div className="absolute right-4 bottom-4 h-32 w-32 flex justify-end items-end select-none">
                  {topComics.map((c, idx) => (
                    <div 
                      key={c.id}
                      className="absolute rounded-md overflow-hidden bg-slate-800 shadow-md border border-white/20 transition-transform group-hover:translate-y-[-4px]"
                      style={{
                        height: '90px',
                        width: '60px',
                        bottom: `${idx * 10}px`,
                        right: `${(topComics.length - 1 - idx) * 16}px`,
                        zIndex: 10 + idx,
                        transform: `rotate(${(idx - 1) * 8}deg)`,
                      }}
                    >
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
                  ))}
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-4 bg-[var(--color-surface)] flex items-center justify-between border-t border-[var(--color-cardBorder)]">
                <button
                  onClick={() => onSelectCategory(cat.name === 'Sin categoría' ? '' : cat.name)}
                  className="flex items-center gap-1.5 text-xs font-bold text-[var(--color-primary)] hover:underline"
                >
                  Ver contenidos
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>

                <span className="text-[10px] font-medium text-[var(--color-textSecondary)]">
                  {cat.comics.filter(c => c.completed).length} de {cat.count} leídos
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
