import { Theme } from '../types';

export const themes: Record<string, Theme> = {
  ocean: {
    name: 'Ocean Trust',
    psychology: 'Azul: confianza, calma y enfoque prolongado en la lectura.',
    colors: {
      primary: '#3b82f6',
      secondary: '#1e40af',
      accent: '#f59e0b',
      background: '#f8fafc',
      surface: '#ffffff',
      text: '#0f172a',
      textSecondary: '#64748b',
      border: '#e2e8f0',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      glow: 'rgba(59, 130, 246, 0.3)',
      surfaceAlpha: 'rgba(255, 255, 255, 0.8)',
      cardBorder: 'rgba(226, 232, 240, 0.8)',
    },
  },

  midnight: {
    name: 'Midnight Focus',
    psychology: 'Oscuro + azul: reduce fatiga visual y favorece sesiones nocturnas.',
    colors: {
      primary: '#60a5fa',
      secondary: '#3b82f6',
      accent: '#fbbf24',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f1f5f9',
      textSecondary: '#94a3b8',
      border: '#334155',
      gradient: 'linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)',
      glow: 'rgba(96, 165, 250, 0.35)',
      surfaceAlpha: 'rgba(30, 41, 59, 0.7)',
      cardBorder: 'rgba(51, 65, 85, 0.5)',
    },
  },

  serene: {
    name: 'Serene Calm',
    psychology: 'Cian claro: serenidad, claridad mental y ambiente relajado.',
    colors: {
      primary: '#0ea5e9',
      secondary: '#0284c7',
      accent: '#14b8a6',
      background: '#f0f9ff',
      surface: '#ffffff',
      text: '#0c4a6e',
      textSecondary: '#0369a1',
      border: '#bae6fd',
      gradient: 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)',
      glow: 'rgba(14, 165, 233, 0.25)',
      surfaceAlpha: 'rgba(255, 255, 255, 0.85)',
      cardBorder: 'rgba(186, 230, 253, 0.5)',
    },
  },

  royal: {
    name: 'Royal Confidence',
    psychology: 'Azul profundo + dorado: autoridad, logro y sensación premium.',
    colors: {
      primary: '#1d4ed8',
      secondary: '#1e3a8a',
      accent: '#d97706',
      background: '#fefefe',
      surface: '#ffffff',
      text: '#1e293b',
      textSecondary: '#475569',
      border: '#cbd5e1',
      gradient: 'linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%)',
      glow: 'rgba(217, 119, 6, 0.3)',
      surfaceAlpha: 'rgba(255, 255, 255, 0.9)',
      cardBorder: 'rgba(203, 213, 225, 0.6)',
    },
  },

  cyberpunk: {
    name: 'Cyberpunk Neon',
    psychology: 'Neón magenta/cian: energía creativa y contraste dramático.',
    colors: {
      primary: '#ff007f',
      secondary: '#00ffff',
      accent: '#ffff00',
      background: '#0a0a12',
      surface: '#121225',
      text: '#f3f4f6',
      textSecondary: '#9ca3af',
      border: '#2a2a4a',
      gradient: 'linear-gradient(135deg, #ff007f 0%, #7928ca 100%)',
      glow: 'rgba(255, 0, 127, 0.45)',
      surfaceAlpha: 'rgba(18, 18, 37, 0.75)',
      cardBorder: 'rgba(255, 0, 127, 0.25)',
    },
  },

  sakura: {
    name: 'Sakura Petals',
    psychology: 'Rosa suave: calidez emocional, acogida y lectura placentera.',
    colors: {
      primary: '#ec4899',
      secondary: '#f472b6',
      accent: '#f59e0b',
      background: '#fff5f7',
      surface: '#ffffff',
      text: '#4d1e2f',
      textSecondary: '#9d5b76',
      border: '#fce7f3',
      gradient: 'linear-gradient(135deg, #ec4899 0%, #f43f5e 100%)',
      glow: 'rgba(236, 72, 153, 0.25)',
      surfaceAlpha: 'rgba(255, 255, 255, 0.85)',
      cardBorder: 'rgba(252, 231, 243, 0.7)',
    },
  },
};

export const defaultTheme = themes.ocean;

const LIGHT_BACKGROUNDS = new Set(['#f8fafc', '#f0f9ff', '#fefefe', '#fff5f7']);

function isLightBackground(background: string): boolean {
  return LIGHT_BACKGROUNDS.has(background.toLowerCase());
}

export function getTheme(themeName: string): Theme {
  return themes[themeName] || defaultTheme;
}

export function applyTheme(theme: Theme): void {
  const root = document.documentElement;
  Object.entries(theme.colors).forEach(([key, value]) => {
    if (value) {
      root.style.setProperty(`--color-${key}`, value);
    }
  });

  if (!theme.colors.gradient) {
    root.style.setProperty(
      '--color-gradient',
      `linear-gradient(135deg, ${theme.colors.primary} 0%, ${theme.colors.secondary} 100%)`
    );
  }
  if (!theme.colors.glow) {
    root.style.setProperty('--color-glow', 'rgba(59, 130, 246, 0.3)');
  }
  if (!theme.colors.surfaceAlpha) {
    const isDark =
      theme.name.toLowerCase().includes('midnight') ||
      theme.name.toLowerCase().includes('cyberpunk') ||
      !isLightBackground(theme.colors.background);
    root.style.setProperty(
      '--color-surfaceAlpha',
      isDark ? 'rgba(30, 41, 59, 0.7)' : 'rgba(255, 255, 255, 0.8)'
    );
  }
  if (!theme.colors.cardBorder) {
    root.style.setProperty('--color-cardBorder', theme.colors.border);
  }

  // Visor de lectura: fondo neutro oscuro en temas claros (menos fatiga)
  const readerBg = isLightBackground(theme.colors.background)
    ? '#0b1220'
    : theme.colors.background;
  root.style.setProperty('--color-reader-bg', readerBg);
  root.style.setProperty('--color-reader-overlay', `${readerBg}e6`);
  root.style.setProperty('--color-hero-bg', theme.colors.secondary);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', theme.colors.background);
  }
}
