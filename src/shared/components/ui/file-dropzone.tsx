import { useRef, useCallback, useState } from "react";
import type { LucideIcon } from "lucide-react";
import { Upload, File, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@shared/lib/cn";
import { Button } from "@ui/button";

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

interface FileDropzoneProps {
  file: File | null;
  onChange: (file: File | null) => void;
  accept: string;
  icon?: LucideIcon;
  emptyLabel: string;
  hint?: string;
  className?: string;
  error?: string;
}

export function FileDropzone({
  file,
  onChange,
  accept,
  icon: Icon = Upload,
  emptyLabel,
  hint,
  className,
  error,
}: FileDropzoneProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleRemove = useCallback(() => {
    onChange(null);
  }, [onChange]);

  const handleFileDrop = useCallback(
    (f: File) => {
      onChange(f);
    },
    [onChange],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0] ?? null;
      if (f) onChange(f);
      if (inputRef.current) inputRef.current.value = "";
    },
    [onChange],
  );

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />

      {!file ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(true);
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
            const f = e.dataTransfer.files?.[0];
            if (f) handleFileDrop(f);
          }}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-sm transition-colors",
            isDragOver
              ? "border-gold bg-gold/5 text-gold"
              : "border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300 hover:text-gray-500",
          )}
        >
          <Icon className="mr-2 h-4 w-4 shrink-0" />
          <span>{emptyLabel}</span>
        </div>
      ) : (
        <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
          <div className="flex h-14 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100">
            <File className="h-5 w-5 text-gray-400" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-medium text-navy">{file.name}</p>
            <p className="text-xs text-gray-400">
              {formatFileSize(file.size)}
              {" · "}
              {file.type || t("fileDropzone.notAvailable")}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-gray-400 hover:bg-error/10 hover:text-error"
            aria-label="Remove file"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {hint && !file && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="mt-1.5 text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
