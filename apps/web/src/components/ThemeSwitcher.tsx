import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../hooks/useTheme';
import { Palette, ChevronDown, Check } from 'lucide-react';
import { cn } from '../utils/cn';

export function ThemeSwitcher() {
  const { currentTheme, setTheme, themes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--color-cardBorder)] bg-[var(--color-surfaceAlpha)] hover:bg-[var(--color-background)] transition-all font-display text-xs font-semibold text-[var(--color-text)] select-none shadow-sm active:scale-95"
      >
        <Palette className="h-4.5 w-4.5 text-[var(--color-primary)]" />
        <span className="hidden md:inline">{currentTheme.name}</span>
        <ChevronDown className={cn("h-3.5 w-3.5 opacity-60 transition-transform", isOpen ? "rotate-180" : "")} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 rounded-2xl glass-card border border-[var(--color-cardBorder)] shadow-xl z-50 overflow-hidden stagger-in">
          <div className="p-3 border-b border-[var(--color-cardBorder)] bg-[var(--color-background)]/50">
            <p className="text-[10px] font-bold text-[var(--color-textSecondary)] uppercase tracking-wider">
              Seleccionar Tema
            </p>
            <p className="text-[10px] text-[var(--color-textSecondary)] mt-1 font-light leading-snug">
              Cada paleta usa psicología del color para confianza, calma o energía.
            </p>
          </div>
          <div className="p-1.5 space-y-0.5">
            {Object.entries(themes).map(([key, theme]) => {
              const isSelected = currentTheme.name === theme.name;
              return (
                <button
                  key={key}
                  onClick={() => {
                    setTheme(key);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between p-2 rounded-xl text-left text-xs font-medium transition-all",
                    isSelected 
                      ? "bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold" 
                      : "text-[var(--color-text)] hover:bg-[var(--color-background)]/85"
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    {/* Circle representing the theme colors */}
                    <div 
                      className="h-4.5 w-4.5 rounded-full border border-white/20 shadow-sm flex-shrink-0"
                      style={{ background: theme.colors.gradient || theme.colors.primary }}
                    />
                    <div className="min-w-0">
                      <span className="truncate block">{theme.name}</span>
                      {theme.psychology && (
                        <span className="block text-[9px] font-normal text-[var(--color-textSecondary)] truncate mt-0.5 leading-tight">
                          {theme.psychology}
                        </span>
                      )}
                    </div>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-[var(--color-primary)] flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
