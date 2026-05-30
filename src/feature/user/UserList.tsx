import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Plus, Search, Filter, Pencil, UserCircle } from "lucide-react";
import { useUsers } from "./api/useUsers";
import { useStore } from "@app/store";
import { Role, canAccessAny } from "@shared/auth/role";
import { useDebouncedValue } from "@shared/hooks/useDebouncedValue";
import { useUserListParams } from "./hooks/useUserListParams";
import { cn } from "@shared/lib/cn";
import type { UserDTO } from "@shared/types/api";

import { PageHeader } from "@shared/components/PageHeader";
import { EmptyState } from "@shared/components/EmptyState";
import { UserAvatar } from "@shared/components/UserAvatar";
import { RoleGate } from "@shared/auth/guards";
import { Button } from "@ui/button";
import { Card } from "@ui/card";
import { Input } from "@ui/input";
import { Skeleton } from "@ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@ui/dropdown-menu";
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
import { SortableTableHead } from "./components/SortableTableHead";
import { UserEditDrawer } from "./components/UserEditDrawer";
import { truncateAddress } from "@shared/lib/format";

export function UserList() {
  const { t } = useTranslation();
  const { params, setParam, setMany } = useUserListParams();
  const debouncedSearch = useDebouncedValue(params.search, 300);
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);

  const currentUser = useStore((s) => s.user);
  const canManageUsers = canAccessAny(currentUser?.role, [Role.ADMIN, Role.SUPER_ADMIN]);

  const { data, isLoading, isError } = useUsers({
    ...params,
    search: debouncedSearch || undefined,
  });

  const users = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / params.limit));
  const isEmpty = !isLoading && users.length === 0;

  function handleSort(key: string) {
    if (params.sort === key) {
      setMany({ sort: key, order: params.order === "desc" ? "asc" : "desc" });
    } else {
      setMany({ sort: key, order: "desc" });
    }
  }

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
              value={params.search}
              onChange={(e) => setParam("search", e.target.value)}
              aria-label="Search users"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" /> {t("user.filter.label")}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setParam("deleted", "all")}>
                  {t("user.filter.all")} {params.deleted === "all" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setParam("deleted", "none")}>
                  {t("user.filter.live")} {params.deleted === "none" && "✓"}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setParam("deleted", "only")}>
                  {t("user.filter.deleted")} {params.deleted === "only" && "✓"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {!isLoading && (
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">
                {t("user.list.count", { count: total })}
              </span>
            )}
          </div>
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
                  <SortableTableHead
                    label="Entity"
                    sortKey="name"
                    currentSort={params.sort}
                    currentOrder={params.order}
                    onSort={handleSort}
                  />
                  <SortableTableHead
                    label="Role"
                    sortKey="role"
                    currentSort={params.sort}
                    currentOrder={params.order}
                    onSort={handleSort}
                  />
                  <SortableTableHead
                    label={t("user.column.phone")}
                    sortKey="phone_number"
                    currentSort={params.sort}
                    currentOrder={params.order}
                    onSort={handleSort}
                  />
                  <SortableTableHead
                    label="Wallet / Status"
                    sortKey="created_at"
                    currentSort={params.sort}
                    currentOrder={params.order}
                    onSort={handleSort}
                  />
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
                      <TableRow key={user.id} className={cn("cursor-pointer", user.deleted_at && "bg-error/5")}>
                        <TableCell>
                          <div className="flex items-center">
                             <UserAvatar user={user} size="md" className="flex-shrink-0" />
                             <div className="ml-4">
                              <div
                                className={cn(
                                  "text-sm font-bold text-fg max-w-[14rem] truncate",
                                  user.deleted_at && "line-through text-gray-400",
                                )}
                                title={user.name ?? "Unnamed"}
                              >
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
                          {user.phone_number ? (
                            <span className="text-sm font-medium text-fg">{user.phone_number}</span>
                          ) : null}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-xs font-mono text-gray-500 mb-1">
                            {user.wallet_address ? truncateAddress(user.wallet_address) : "—"}
                          </div>
                          <UserStatusBadge deletedAt={user.deleted_at} />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingUser(user)}
                            disabled={!!user.deleted_at}
                            aria-label={`Edit ${user.name ?? user.email}`}
                          >
                            <Pencil className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>

            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 sm:p-6 border-t border-gray-50">
                <span className="text-sm text-gray-500">
                  Page {params.page} of {totalPages}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={params.page <= 1 || isLoading}
                    onClick={() => setParam("page", Math.max(1, params.page - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={params.page >= totalPages || isLoading}
                    onClick={() => setParam("page", Math.min(totalPages, params.page + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <UserEditDrawer user={editingUser} onClose={() => setEditingUser(null)} />

      {!canManageUsers && (
        <p className="text-xs text-gray-400 text-center">
          Role management requires Admin access.
        </p>
      )}
    </div>
  );
}
