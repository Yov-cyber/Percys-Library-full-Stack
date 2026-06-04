import { useRef, useState, useEffect } from 'react';
import { X, Upload as UploadIcon, FileText, CheckCircle2, AlertTriangle, File, Plus } from 'lucide-react';
import { cn } from '../utils/cn';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (files: File[]) => Promise<any>;
}

export function UploadModal({ isOpen, onClose, onUpload }: UploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<{
    success: boolean;
    added: number;
    skipped: number;
    failed: number;
    details?: string;
  } | null>(null);

  // Reset local state when closed/opened
  useEffect(() => {
    if (isOpen) {
      setSelectedFiles([]);
      setUploading(false);
      setResults(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && !uploading) onClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, uploading, onClose]);

  if (!isOpen) return null;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files).filter(validateFile);
    if (files.length > 0) {
      setSelectedFiles(prev => [...prev, ...files]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const validFiles = Array.from(files).filter(validateFile);
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }
  };

  const validateFile = (file: File) => {
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    return ['.cbz', '.cbr', '.pdf', '.zip', '.rar'].includes(ext);
  };

  const handleUploadClick = async () => {
    if (selectedFiles.length === 0) return;
    try {
      setUploading(true);
      const res = await onUpload(selectedFiles);
      setResults({
        success: true,
        added: res.uploaded?.length || 0,
        skipped: res.skipped?.length || 0,
        failed: res.failed?.length || 0,
      });
    } catch (err) {
      setResults({
        success: false,
        added: 0,
        skipped: 0,
        failed: selectedFiles.length,
        details: err instanceof Error ? err.message : 'Error desconocido al subir archivos',
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (idx: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== idx));
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 1;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-modal-title"
      onClick={(e) => { if (e.target === e.currentTarget && !uploading) onClose(); }}
    >
      <div className="relative w-full max-w-lg rounded-3xl glass-card p-6 shadow-2xl animate-scale-in border border-[var(--color-cardBorder)] max-h-[90vh] flex flex-col justify-between">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--color-cardBorder)] pb-4 mb-4 flex-shrink-0">
          <div>
            <h2 id="upload-modal-title" className="text-lg font-bold text-[var(--color-text)] font-display">
              Importar Archivos
            </h2>
            <p className="text-[10px] text-[var(--color-textSecondary)] mt-0.5">Sube tus cómics en formato digital</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[var(--color-textSecondary)] transition-colors hover:bg-[var(--color-background)] hover:text-[var(--color-text)]"
            disabled={uploading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {!results ? (
            <>
              {/* Drag Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={cn(
                  "relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all flex flex-col items-center justify-center gap-3",
                  isDragging
                    ? "border-[var(--color-primary)] bg-[var(--color-primary)]/5"
                    : "border-[var(--color-cardBorder)] hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-background)]/50",
                  uploading ? "opacity-50 pointer-events-none" : ""
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".cbz,.cbr,.pdf,.zip,.rar"
                  multiple
                  onChange={handleFileSelect}
                  className="hidden"
                />
                
                <div className="rounded-2xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] p-3.5 shadow-sm">
                  <UploadIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold text-xs text-[var(--color-text)]">
                    Arrastra múltiples archivos aquí
                  </p>
                  <p className="text-[11px] text-[var(--color-textSecondary)] mt-1 font-light">
                    o presiona para navegar por tu ordenador
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-1.5 text-[9px] font-bold text-[var(--color-textSecondary)] uppercase tracking-wide mt-1">
                  {['.cbz', '.cbr', '.pdf', '.zip'].map(ext => (
                    <span key={ext} className="rounded bg-[var(--color-border)] px-1.5 py-0.5 border border-[var(--color-cardBorder)]">
                      {ext}
                    </span>
                  ))}
                </div>
              </div>

              {/* Selected Files List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-2xs font-extrabold uppercase text-[var(--color-textSecondary)] tracking-wider">
                    Archivos seleccionados ({selectedFiles.length})
                  </h4>
                  <div className="max-h-48 overflow-y-auto space-y-1.5 border border-[var(--color-cardBorder)] rounded-2xl p-2 bg-[var(--color-background)]/35">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs p-2 rounded-xl bg-[var(--color-surface)] border border-[var(--color-cardBorder)] gap-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <File className="h-4 w-4 text-[var(--color-primary)] flex-shrink-0" />
                          <span className="truncate font-semibold text-[var(--color-text)]" title={file.name}>
                            {file.name}
                          </span>
                          <span className="text-[10px] text-[var(--color-textSecondary)] flex-shrink-0">
                            ({formatBytes(file.size)})
                          </span>
                        </div>
                        <button
                          onClick={() => removeFile(idx)}
                          className="text-[var(--color-textSecondary)] hover:text-red-500 rounded p-1"
                          disabled={uploading}
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Upload Results screen */
            <div className="space-y-4 py-4 text-center">
              {results.success ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h3 className="text-sm font-bold text-[var(--color-text)] font-display">¡Importación completada!</h3>
                  <div className="w-full max-w-xs grid grid-cols-3 gap-2 mt-4 text-xs font-semibold">
                    <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/10 text-emerald-600">
                      <div className="text-lg font-bold">{results.added}</div>
                      <div className="text-[9px] uppercase font-bold tracking-wider mt-1 text-emerald-500">Agregados</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/10 text-amber-600">
                      <div className="text-lg font-bold">{results.skipped}</div>
                      <div className="text-[9px] uppercase font-bold tracking-wider mt-1 text-amber-500">Duplicados</div>
                    </div>
                    <div className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/10 text-red-600">
                      <div className="text-lg font-bold">{results.failed}</div>
                      <div className="text-[9px] uppercase font-bold tracking-wider mt-1 text-red-500">Fallidos</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-red-500">
                  <AlertTriangle className="h-10 w-10" />
                  <h3 className="text-sm font-bold font-display">Error en la subida</h3>
                  <p className="text-xs text-[var(--color-textSecondary)]">{results.details}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="border-t border-[var(--color-cardBorder)] pt-4 mt-4 flex justify-end gap-2 flex-shrink-0">
          {!results ? (
            <>
              <button
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-[var(--color-text)] border border-[var(--color-cardBorder)] rounded-xl hover:bg-[var(--color-background)]"
                disabled={uploading}
              >
                Cancelar
              </button>
              <button
                onClick={handleUploadClick}
                className="px-5 py-2 text-xs font-bold text-white bg-[var(--color-primary)] rounded-xl hover:bg-[var(--color-secondary)] hover:shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                disabled={selectedFiles.length === 0 || uploading}
              >
                {uploading ? 'Subiendo archivos...' : `Importar ${selectedFiles.length} archivos`}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-5 py-2 text-xs font-bold text-white bg-[var(--color-primary)] rounded-xl hover:bg-[var(--color-secondary)] transition-all"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
