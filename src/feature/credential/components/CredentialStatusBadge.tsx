import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Badge } from "@ui/badge";

interface CredentialStatusBadgeProps {
  revoked: boolean;
}

export function CredentialStatusBadge({ revoked }: CredentialStatusBadgeProps) {
  return revoked ? (
    <Badge tone="error">
      <ShieldAlert className="w-3 h-3 mr-1" aria-hidden="true" />
      Revoked
    </Badge>
  ) : (
    <Badge tone="green">
      <ShieldCheck className="w-3 h-3 mr-1" aria-hidden="true" />
      Active
    </Badge>
  );
}
