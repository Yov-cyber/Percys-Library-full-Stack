import { useEffect } from 'react';

const BASE = "Percy's Library";

export function useDocumentTitle(title?: string, description?: string) {
  useEffect(() => {
    document.title = title ? `${title} — ${BASE}` : `${BASE} — Tu portal de lectura`;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (meta) {
        meta.setAttribute('content', description);
      }
    }

    return () => {
      document.title = `${BASE} — Tu portal de lectura`;
    };
  }, [title, description]);
}
