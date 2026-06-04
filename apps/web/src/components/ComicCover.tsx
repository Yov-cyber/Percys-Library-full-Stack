import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { cn } from '../utils/cn';

interface ComicCoverProps {
  comicId: string;
  title?: string;
  className?: string;
  imgClassName?: string;
  loading?: 'lazy' | 'eager';
}

export function ComicCover({ comicId, title, className, imgClassName, loading = 'lazy' }: ComicCoverProps) {
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn('relative overflow-hidden bg-gradient-to-br from-[var(--color-primary)]/15 to-[var(--color-secondary)]/10', className)}>
      {!failed && (
        <img
          src={`/api/comics/${comicId}/cover`}
          alt={title ? `Portada de ${title}` : ''}
          className={cn('h-full w-full object-cover', imgClassName)}
          loading={loading}
          onError={() => setFailed(true)}
        />
      )}
      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-[var(--color-primary)]/60">
          <BookOpen className="h-6 w-6" />
          {title && (
            <span className="text-[8px] font-bold uppercase tracking-wider px-2 text-center line-clamp-2">
              {title}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
