import { useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { CredentialFilePreview } from "./CredentialFilePreview";

interface CredentialFileInputProps {
  file: File | null;
  onChange: (file: File | null) => void;
  onExpand?: () => void;
  error?: string;
}

export function CredentialFileInput({
  file,
  onChange,
  onExpand,
  error,
}: CredentialFileInputProps) {
  const { t } = useTranslation();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleRemove = useCallback(() => {
    onChange(null);
  }, [onChange]);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.tiff"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          if (f) onChange(f);
          if (inputRef.current) inputRef.current.value = "";
        }}
        className="hidden"
      />
      <div onClick={() => inputRef.current?.click()}>
        <CredentialFilePreview
          file={file}
          onExpand={onExpand ?? (() => {})}
          onRemove={handleRemove}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-error" role="alert">
          {t(error)}
        </p>
      )}
    </div>
  );
}
