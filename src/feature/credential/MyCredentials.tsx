import { FileBadge } from "lucide-react";
import { useMyCredentials } from "./api/useMyCredentials";
import { PageHeader } from "@shared/components/PageHeader";
import { EmptyState } from "@shared/components/EmptyState";
import { Skeleton } from "@ui/skeleton";
import { CredentialCard } from "./components/CredentialCard";

export function MyCredentials() {
  const { data, isLoading, isError } = useMyCredentials();
  const credentials = data?.items ?? [];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="My Credentials"
        description="Manage and view your personal verifiable digital records."
      />

      {isError ? (
        <EmptyState
          icon={FileBadge}
          title="Couldn't load your credentials"
          description="Please try again in a moment."
        />
      ) : isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-2xl" />
          ))}
        </div>
      ) : credentials.length === 0 ? (
        <EmptyState
          icon={FileBadge}
          title="No credentials yet"
          description="Issued credentials linked to your wallet will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {credentials.map((cred) => (
            <CredentialCard key={cred.id} credential={cred} />
          ))}
        </div>
      )}
    </div>
  );
}
