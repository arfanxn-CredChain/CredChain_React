import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Ban,
  Loader2,
  ShieldAlert,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { useCredential } from "./api/useCredential";
import { useUser } from "@feature/user/api/useUser";
import { sha256File } from "@shared/lib/hash";
import { DecorBlob } from "@shared/components/DecorBlob";
import { EyebrowLabel } from "@shared/components/EyebrowLabel";
import { MonoId } from "@shared/components/MonoId";
import { Card } from "@ui/card";
import { CredentialStatusBadge } from "./components/CredentialStatusBadge";
import { formatDate, formatDateTime } from "@shared/lib/format";
import { cn } from "@shared/lib/cn";

type VerifyState = "idle" | "hashing" | "match" | "mismatch";

export function VerifyCredential() {
  const { credentialId } = useParams<{ credentialId: string }>();
  const { data: cred, isLoading, isError } = useCredential(credentialId ?? "");
  const { data: issuer } = useUser(cred?.issuer_id ?? "");

  const [verifyState, setVerifyState] = useState<VerifyState>("idle");
  const [computedHash, setComputedHash] = useState<string | null>(null);
  const [prevId, setPrevId] = useState(credentialId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset verification state when navigating to a different credential.
  // React 19 pattern: store deps and call setState during render (not in effect).
  if (prevId !== credentialId) {
    setPrevId(credentialId);
    setVerifyState("idle");
    setComputedHash(null);
  }

  const handleFile = async (file: File) => {
    setVerifyState("hashing");
    setComputedHash(null);
    try {
      const hash = await sha256File(file);
      setComputedHash(hash);
      setVerifyState(hash === cred?.hash ? "match" : "mismatch");
    } catch {
      setVerifyState("idle");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-navy" aria-label="Loading..." />
      </div>
    );
  }

  if (isError || !cred) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
        <ShieldAlert className="h-16 w-16 text-error mb-4" aria-hidden="true" />
        <h2 className="font-display text-3xl font-extrabold text-navy tracking-tight mb-2">
          Record Not Found
        </h2>
        <p className="text-gray-500 mb-8 max-w-md">
          The requested credential identifier does not exist or has been permanently removed from
          the ledger.
        </p>
        <Link
          to="/login"
          className="text-gold font-bold hover:text-navy transition-colors inline-flex items-center"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-12 px-4 sm:px-6">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center p-3 bg-navy rounded-2xl mb-2 shadow-lg shadow-navy/20">
          <ShieldCheck className="h-10 w-10 text-gold" aria-hidden="true" />
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-extrabold text-navy tracking-tight text-balance">
          Credential Verification
        </h2>
        <p className="text-lg text-gray-500 max-w-xl mx-auto text-pretty">
          Cryptographically verify the authenticity of a digital document against the on-chain
          ledger.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="p-6 sm:p-10 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div>
            <EyebrowLabel>Credential Type</EyebrowLabel>
            <div className="font-display text-2xl font-bold text-navy mt-1">{cred.type}</div>
            {cred.title && <p className="text-sm text-gray-500 mt-1">{cred.title}</p>}
          </div>
          <CredentialStatusBadge revoked={cred.revoked} />
        </div>

        <div className="bg-gray-50/50 p-6 sm:p-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <EyebrowLabel>Blockchain Hash Signature</EyebrowLabel>
              <code className="block font-mono text-xs text-navy bg-white border border-gray-200 p-3 rounded-xl break-all shadow-sm mt-1">
                {cred.hash}
              </code>
            </div>
            <div>
              <EyebrowLabel>Issuing Authority</EyebrowLabel>
              <p className="text-sm font-bold text-navy mt-1">
                {issuer?.name ?? issuer?.email ?? ""}
              </p>
              <MonoId value={cred.issuer_id} className="mt-0.5 block" />
            </div>
            <div>
              <EyebrowLabel>Date of Issuance</EyebrowLabel>
              <p className="text-sm font-bold text-navy mt-1">{formatDateTime(cred.issued_at)}</p>
            </div>
            {cred.valid_until && (
              <div>
                <EyebrowLabel>Valid Until</EyebrowLabel>
                <p className="text-sm font-bold text-navy mt-1">{formatDate(cred.valid_until)}</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden min-h-[250px]">
            {cred.revoked ? (
              <div className="flex flex-col items-center">
                <Ban className="h-16 w-16 text-error/20 mb-4" aria-hidden="true" />
                <p className="text-sm font-bold text-error">Verification Disabled</p>
                <p className="text-xs text-error/70 mt-2 px-4">
                  This record has been explicitly revoked and can no longer be cryptographically
                  asserted.
                </p>
              </div>
            ) : (
              <>
                <DecorBlob tone="gold" position="top-right" size="md" />
                <Upload className="mx-auto h-12 w-12 text-gold mb-4 relative z-10" aria-hidden="true" />
                <h3 className="font-display text-lg font-bold text-navy relative z-10">
                  Verify Source Document
                </h3>
                <p className="mt-2 text-sm text-gray-500 mb-6 relative z-10">
                  Upload the original file to compute a local SHA-256 hash and compare it against
                  the ledger.
                </p>
                <div className="relative z-10 w-full">
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    id="file-upload"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) void handleFile(file);
                    }}
                    aria-label="Upload file for verification"
                  />
                  <label
                    htmlFor="file-upload"
                    className={cn(
                      "cursor-pointer inline-flex items-center justify-center w-full px-6 py-3",
                      "border border-transparent rounded-xl shadow-md text-sm font-bold text-surface",
                      "bg-navy hover:bg-navy/90 transition-all",
                      "focus-within:ring-2 focus-within:ring-navy focus-within:ring-offset-2",
                    )}
                  >
                    {verifyState === "hashing" ? (
                      <>
                        <Loader2 className="animate-spin mr-2 h-5 w-5" aria-hidden="true" />
                        Processing...
                      </>
                    ) : (
                      "Select File for Verification"
                    )}
                  </label>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {(verifyState === "match" || verifyState === "mismatch") && !cred.revoked && (
        <div
          role="status"
          aria-live="polite"
          className={cn(
            "rounded-2xl p-6 md:p-8 flex items-start gap-4 shadow-lg",
            verifyState === "match"
              ? "bg-green-500 text-white shadow-green-500/20"
              : "bg-error text-white shadow-error/20",
          )}
        >
          {verifyState === "match" ? (
            <ShieldCheck className="h-8 w-8 shrink-0 mt-1" aria-hidden="true" />
          ) : (
            <ShieldAlert className="h-8 w-8 shrink-0 mt-1" aria-hidden="true" />
          )}
          <div>
            <h3 className="font-display text-xl font-extrabold tracking-tight mb-2">
              {verifyState === "match" ? "Verification Successful" : "Verification Failed"}
            </h3>
            <p className="text-white/90 text-sm leading-relaxed max-w-2xl">
              {verifyState === "match"
                ? "The provided document is authentic. Its computed hash matches the official ledger signature precisely."
                : "The document does NOT match the signature on the ledger. It may have been altered or is an incorrect file."}
            </p>
            {computedHash && (
              <div className="mt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-white/70 block mb-1">
                  Computed Local Hash
                </span>
                <code className="font-mono text-sm opacity-90 break-all">{computedHash}</code>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
