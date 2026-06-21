import { useRef } from "react";
import { File, X } from "lucide-react";
import { cn } from "@shared/lib/cn";

interface CredentialFileInputProps {
  file: File | null;
  onChange: (file: File | null) => void;
  error?: string;
  placeholder?: string;
  removeLabel?: string;
  hint?: string;
}

export function CredentialFileInput({
  file,
  onChange,
  error,
  placeholder = "Select a file...",
  removeLabel = "Remove file",
  hint,
}: CredentialFileInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp,.tiff"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          onChange(f);
          if (inputRef.current) inputRef.current.value = "";
        }}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left shadow-sm transition-all",
          "bg-gray-50 text-sm",
          error
            ? "border-error focus:ring-2 focus:ring-error focus:border-transparent"
            : "border-gray-200 focus:border-transparent focus:ring-2 focus:ring-gold focus:bg-white",
        )}
      >
        <File className="h-5 w-5 shrink-0 text-gray-400" />
        {file ? (
          <>
            <span className="flex-1 truncate text-navy font-medium">{file.name}</span>
            <span
              role="button"
              aria-label={removeLabel}
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-error/10 hover:text-error transition-colors"
            >
              <X className="h-4 w-4" />
            </span>
          </>
        ) : (
          <span className="text-gray-400">{placeholder}</span>
        )}
      </button>
      {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
    </div>
  );
}
