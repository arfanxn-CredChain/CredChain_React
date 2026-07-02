import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { File, Upload, Eye, X } from "lucide-react";
import { Button } from "@ui/button";
import { cn } from "@shared/lib/cn";
import type { RenderParameters } from "pdfjs-dist/types/src/display/api";

interface CredentialFilePreviewProps {
  file: File | null;
  onExpand: () => void;
  onRemove: () => void;
  onFileDrop: (file: File) => void;
}

const ALLOWED_IMAGE_MIME_PREFIXES = ["image/jpeg", "image/png", "image/webp"];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CredentialFilePreview({
  file,
  onExpand,
  onRemove,
  onFileDrop,
}: CredentialFilePreviewProps) {
  const { t } = useTranslation();
  const [isDragOver, setIsDragOver] = useState(false);

  if (!file) {
    return (
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
          if (f) onFileDrop(f);
        }}
        className={cn(
          "flex items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 text-sm transition-colors",
          isDragOver
            ? "border-gold bg-gold/5 text-gold"
            : "border-gray-200 bg-gray-50 text-gray-400 hover:border-gray-300 hover:text-gray-500",
        )}
      >
        <Upload className="mr-2 h-4 w-4 shrink-0" />
        <span>{t("credential.issue.preview.dragDrop")}</span>
      </div>
    );
  }

  const isImage = ALLOWED_IMAGE_MIME_PREFIXES.some((prefix) => file.type.startsWith(prefix));

  return (
    <div className="flex items-center gap-4 rounded-xl border border-gray-100 bg-gray-50/50 p-3">
      <PreviewThumbnail file={file} isImage={isImage} />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-3 text-sm font-medium text-navy">{file.name}</p>
        <p className="text-xs text-gray-400">
          {formatFileSize(file.size)}
          {" · "}
          {file.type || t("credential.issue.preview.notAvailable")}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:bg-gold/10 hover:text-gold"
          aria-label={t("credential.issue.preview.expand")}
          onClick={onExpand}
        >
          <Eye className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-gray-400 hover:bg-error/10 hover:text-error"
          aria-label={t("credential.issue.preview.remove")}
          onClick={onRemove}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function PdfThumbnail({ file }: { file: File }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const objectUrl = URL.createObjectURL(file);

    const render = async () => {
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();

        const pdf = await pdfjsLib.getDocument(objectUrl).promise;
        if (cancelled) {
          pdf.destroy();
          return;
        }

        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 0.15 });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) {
          pdf.destroy();
          return;
        }

        const ctx = canvas.getContext("2d")!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        await page.render({ canvasContext: ctx, viewport } as RenderParameters).promise;
        pdf.destroy();
      } catch {
        if (!cancelled) setError(true);
      }
    };

    render();

    return () => {
      cancelled = true;
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  if (error) {
    return (
      <div className="flex h-14 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        <File className="h-5 w-5 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-white">
      <canvas ref={canvasRef} className="h-full w-full object-cover" />
    </div>
  );
}

function PreviewThumbnail({ file, isImage }: { file: File; isImage: boolean }) {
  const isPdf = file.type === "application/pdf";
  const objectUrlRef = useRef<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isPdf || !isImage) return;
    const url = URL.createObjectURL(file);
    objectUrlRef.current = url;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setObjectUrl(url);
    setError(false);
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [file, isImage, isPdf]);

  if (isPdf) return <PdfThumbnail file={file} />;
  if (!isImage) {
    return (
      <div className="flex h-14 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        <File className="h-5 w-5 text-gray-400" />
      </div>
    );
  }
  if (error || !objectUrl) {
    return (
      <div className="flex h-14 w-12 shrink-0 items-center justify-center rounded-lg bg-gray-100">
        <File className="h-5 w-5 text-gray-400" />
      </div>
    );
  }
  return (
    <div className="h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-gray-100">
      <img
        src={objectUrl}
        alt={file.name}
        className="h-full w-full object-cover"
        onError={() => setError(true)}
      />
    </div>
  );
}
