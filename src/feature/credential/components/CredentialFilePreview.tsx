import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { File, Upload, Eye, X } from "lucide-react";
import { Button } from "@ui/button";

interface CredentialFilePreviewProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onExpand: () => void;
  onRemove: () => void;
}

const ALLOWED_IMAGE_MIME_PREFIXES = ["image/jpeg", "image/png", "image/webp"];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CredentialFilePreview({
  file,
  onFileSelect: _onFileSelect,
  onExpand,
  onRemove,
}: CredentialFilePreviewProps) {
  const { t } = useTranslation();

  if (!file) {
    return (
      <div className="flex items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 px-4 py-6 text-sm text-gray-400 transition-colors hover:border-gray-300 hover:text-gray-500">
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
        <p className="truncate text-sm font-medium text-navy">{file.name}</p>
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

function PreviewThumbnail({ file, isImage }: { file: File; isImage: boolean }) {
  const objectUrlRef = useRef<string | null>(null);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isImage) {
      const url = URL.createObjectURL(file);
      objectUrlRef.current = url;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- object URL lifecycle requires ref for cleanup + state for render
      setObjectUrl(url);
      setError(false);
      return () => {
        if (objectUrlRef.current) {
          URL.revokeObjectURL(objectUrlRef.current);
          objectUrlRef.current = null;
        }
      };
    }
  }, [file, isImage]);

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
