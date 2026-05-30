import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, ChevronRight, UserCircle } from "lucide-react";
import { useUsers } from "./api/useUsers";
import { useStore } from "@app/store";
import { Role, canAccessAny } from "@shared/auth/role";
import { useDebouncedValue } from "@shared/hooks/useDebouncedValue";

import { PageHeader } from "@shared/components/PageHeader";
import { EmptyState } from "@shared/components/EmptyState";
import { MonoId } from "@shared/components/MonoId";
import { UserAvatar } from "@shared/components/UserAvatar";
import { RoleGate } from "@shared/auth/guards";
import { Button } from "@ui/button";
import { Card } from "@ui/card";
import { Input } from "@ui/input";
import { Skeleton } from "@ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@ui/table";

import { UserRoleBadge } from "./components/UserRoleBadge";
import { UserStatusBadge } from "./components/UserStatusBadge";
import { truncateAddress } from "@shared/lib/format";

const PAGE_SIZE = 25;

export function UserList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebouncedValue(search, 300);

  const currentUser = useStore((s) => s.user);
  const canManageUsers = canAccessAny(currentUser?.role, [Role.ADMIN, Role.SUPER_ADMIN]);

  const { data, isLoading, isError } = useUsers({
    page,
    limit: PAGE_SIZE,
    search: debouncedSearch || undefined,
  });

  const users = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const isEmpty = !isLoading && users.length === 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title="User Directory"
        description="Manage system entities and their authorized roles."
        action={
          <RoleGate allowed={[Role.ADMIN, Role.SUPER_ADMIN]}>
            <Button asChild variant="gold">
              <Link to="/users/create">
                <Plus className="h-5 w-5" />
                Register Entity
              </Link>
            </Button>
          </RoleGate>
        }
      />

      <Card className="p-0">
        <div className="p-4 sm:p-6 border-b border-gray-50 flex justify-between items-center gap-4">
          <div className="relative w-full max-w-md">
            <Input
              type="search"
              inputMode="search"
              enterKeyHint="search"
              leadingIcon={Search}
              placeholder="Search by name, email or role..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              aria-label="Search users"
            />
          </div>
          {!isLoading && (
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
              {total.toLocaleString()} {total === 1 ? "entity" : "entities"}
            </span>
          )}
        </div>

        {isError ? (
          <div className="p-12 text-center text-error text-sm">
            Failed to load users. Please try again.
          </div>
        ) : isEmpty ? (
          <EmptyState
            icon={UserCircle}
            title={debouncedSearch ? "No users match your search" : "No users yet"}
            description={
              debouncedSearch
                ? `Try a different search term.`
                : `Register the first entity to populate the directory.`
            }
            className="border-0 shadow-none rounded-none"
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entity</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Wallet / Status</TableHead>
                  <TableHead className="relative">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`sk-${i}`}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <div className="space-y-2">
                              <Skeleton className="h-4 w-32" />
                              <Skeleton className="h-3 w-40" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-28" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-32" />
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-4 w-16 ml-auto" />
                        </TableCell>
                      </TableRow>
                    ))
                  : users.map((user) => (
                      <TableRow key={user.id} className="cursor-pointer">
                        <TableCell>
                          <div className="flex items-center">
                             <UserAvatar user={user} size="md" className="flex-shrink-0" />
                             <div className="ml-4">
                              <div className="text-sm font-bold text-navy">
                                {user.name ?? "Unnamed"}
                              </div>
                              <div className="text-xs text-gray-500 font-medium mt-0.5">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <UserRoleBadge role={user.role} />
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-medium text-navy">
                            {user.phone_number ?? "—"}
                          </div>
                          <MonoId value={user.id} className="mt-0.5" />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-xs font-mono text-gray-500 mb-1">
                            {user.wallet_address ? truncateAddress(user.wallet_address) : "—"}
                          </div>
                          <UserStatusBadge deletedAt={user.deleted_at} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild variant="ghost" size="sm">
                            <Link to={`/users/${user.id}`} aria-label={`View ${user.name ?? user.email}`}>
                              View <ChevronRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-50">
                <span className="text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page <= 1 || isLoading}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={page >= totalPages || isLoading}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {!canManageUsers && (
        <p className="text-xs text-gray-400 text-center">
          Role management requires Admin access.
        </p>
      )}
    </div>
  );
}
