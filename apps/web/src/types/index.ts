export interface Comic {
  id: string;
  title: string;
  author?: string;
  coverPath?: string;
  filePath?: string;
  format: 'cbz' | 'cbr' | 'pdf' | 'folder';
  pageCount: number;
  currentPage: number;
  completed: boolean;
  category?: string | null;
  categories?: string[];
  tags?: string[];
  isFavorite: boolean;
  rating?: number;
  lastReadAt?: Date | null;
  lastRead?: Date | null;
  addedAt: Date;
  updatedAt?: Date;
  year?: number;
  publisher?: string;
  description?: string;
  sizeBytes?: number;
}

export interface ReadingProgress {
  comicId: string;
  currentPage: number;
  totalPages: number;
  lastRead: Date;
  readingTime?: number; // in minutes
}

export interface Theme {
  name: string;
  /** Breve explicación de la psicología del color aplicada al tema */
  psychology?: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    glow?: string;
    gradient?: string;
    surfaceAlpha?: string;
    cardBorder?: string;
  };
}

export type ViewMode = 'single' | 'double' | 'scroll';
export type ReadingDirection = 'left-to-right' | 'right-to-left';

// New types for enhanced features
export interface Achievement {
  id: string;
  title: string;
  description: string;
  group: string;
  tier: number;
  secret: boolean;
  unlockHint: string | null;
  unlocked: boolean;
}

export interface UserStats {
  totalComics: number;
  completedComics: number;
  inProgressComics: number;
  pagesRead: number;
  favorites: number;
  currentStreak: number;
  longestStreak: number;
  todayPages: number;
  bestDayPages: number;
  days: { id: string; date: string; pagesRead: number; ownerId: string }[];
  totalReadingDays: number;
  daysActive7: number;
  daysActive30: number;
  formats: { key: string; count: number }[];
  categories: { key: string; count: number }[];
  topRead: { id: string; title: string; format: string; pageCount: number; currentPage: number; completed: boolean; pagesEstimated: number }[];
  almostDone: { id: string; title: string; format: string; pageCount: number; currentPage: number; completed: boolean; pagesEstimated: number }[];
  lastCompleted: { id: string; title: string; format: string; pageCount: number; currentPage: number; completed: boolean; pagesEstimated: number } | null;
  totalBytes: number;
  averagePagesPerActiveDay: number;
  totalReadingTimeMinutes: number;
  averageSessionMinutes: number;
}

export interface Collection {
  id: string;
  name: string;
  description?: string;
  coverColor?: string;
  comicIds: string[];
  createdAt: Date;
  isPublic?: boolean;
}

export interface ReadingSession {
  id: string;
  comicId: string;
  startTime: Date;
  endTime: Date;
  pagesRead: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
  comicCount: number;
}
