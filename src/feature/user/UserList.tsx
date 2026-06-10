import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Plus,
  Search,
  Filter,
  Pencil,
  UserCircle,
  MoreVertical,
  ArrowRightLeft,
  Trash2,
  RotateCcw,
} from "lucide-react";
import { useUsers } from "./api/useUsers";
import { useTransferSuperAdmin } from "./api/useTransferSuperAdmin";
import { useDeleteUsers } from "./api/useDeleteUsers";
import { useRestoreUsers } from "./api/useRestoreUsers";
import { useStore } from "@app/store";
import { Role, canAccessAny } from "@shared/auth/role";
import { useDebouncedValue } from "@shared/hooks/useDebouncedValue";
import { useUserListParams } from "./hooks/useUserListParams";
import { cn } from "@shared/lib/cn";
import { useConfirm } from "@ui/confirm-dialog";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/select";
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
import { SortMenu } from "./components/SortMenu";
import { RoleFilterMenu } from "./components/RoleFilterMenu";
import { CopyInlineButton } from "@shared/components/CopyInlineButton";
import { UserEditDrawer } from "./components/UserEditDrawer";
import { truncateAddress } from "@shared/lib/format";

export function UserList() {
  const { t } = useTranslation();
  const { params, setParam, setMany } = useUserListParams();
  const debouncedSearch = useDebouncedValue(params.search, 300);
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);
  const transfer = useTransferSuperAdmin();
  const deleteUsers = useDeleteUsers();
  const restoreUsers = useRestoreUsers();
  const { confirm, dialog } = useConfirm();

  const currentUser = useStore((s) => s.user);
  const canManageUsers = canAccessAny(currentUser?.role, [Role.ADMIN, Role.SUPER_ADMIN]);

  const { data, isLoading, isError } = useUsers({
    ...params,
    search: debouncedSearch || undefined,
    role: params.role === "all" ? undefined : params.role,
  });

  const users = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / params.limit));
  const isEmpty = !isLoading && users.length === 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <PageHeader
        title={t("user.list.title")}
        description={t("user.list.description")}
        action={
          <RoleGate allowed={[Role.ADMIN, Role.SUPER_ADMIN]}>
            <Button asChild variant="gold">
              <Link to="/users/create">
                <Plus className="h-5 w-5" />
                {t("user.list.registerCta")}
              </Link>
            </Button>
          </RoleGate>
        }
      />

      <Card className="p-0">
        <div className="p-4 sm:p-6 border-b border-gray-50">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="w-full md:max-w-md md:flex-1">
              <Input
                type="search"
                inputMode="search"
                enterKeyHint="search"
                leadingIcon={Search}
                placeholder={t("user.list.searchPlaceholder")}
                value={params.search}
                onChange={(e) => setParam("search", e.target.value)}
                aria-label={t("user.list.searchPlaceholder")}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 md:ml-auto md:shrink-0">
              <SortMenu
                sort={params.sort}
                order={params.order}
                onChange={(s, o) => setMany({ sort: s, order: o })}
              />
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
              <RoleFilterMenu
                value={params.role}
                onChange={(r) => setParam("role", r)}
              />
              <Select
                value={String(params.limit)}
                onValueChange={(v) => setParam("limit", parseInt(v, 10))}
              >
                <SelectTrigger
                  className="w-[88px] py-2 h-9"
                  aria-label={t("user.list.limitLabel")}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          {!isLoading && (
            <div className="mt-3 text-xs font-bold text-gray-400 uppercase tracking-wider">
              {t("user.list.count", { count: total })}
            </div>
          )}
        </div>

        {isError ? (
          <div className="p-12 text-center text-error text-sm">
            {t("user.list.error")}
          </div>
        ) : isEmpty ? (
          <EmptyState
            icon={UserCircle}
            title={debouncedSearch ? t("user.list.empty.search.title") : t("user.list.empty.none.title")}
            description={
              debouncedSearch
                ? t("user.list.empty.search.body")
                : t("user.list.empty.none.body")
            }
            className="border-0 shadow-none rounded-none"
          />
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("user.column.entity")}</TableHead>
                  <TableHead>{t("user.column.role")}</TableHead>
                  <TableHead>{t("user.column.walletStatus")}</TableHead>
                  <TableHead className="relative">
                    <span className="sr-only">{t("user.column.actions")}</span>
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
                              <Skeleton className="h-3 w-16" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Skeleton className="h-5 w-20" />
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
                             <div className="ml-4 min-w-0">
                              <div
                                className={cn(
                                  "text-sm font-bold text-navy max-w-[14rem] truncate",
                                  user.deleted_at && "line-through text-gray-400",
                                )}
                                title={user.name ?? t("user.edit.unnamed")}
                              >
                                {user.name ?? t("user.edit.unnamed")}
                              </div>
                              <div className="flex items-center gap-1 min-w-0 mt-0.5">
                                <span className="text-xs text-gray-500 font-medium truncate max-w-[12rem]">
                                  {user.email}
                                </span>
                                <CopyInlineButton
                                  value={user.email}
                                  ariaLabel={t("user.copy.email")}
                                />
                              </div>
                              {user.phone_number && (
                                <div className="flex items-center gap-1 min-w-0 mt-0.5">
                                  <span className="text-xs text-gray-400 truncate max-w-[12rem]">
                                    {user.phone_number}
                                  </span>
                                  <CopyInlineButton
                                    value={user.phone_number}
                                    ariaLabel={t("user.copy.phone")}
                                  />
                                </div>
                              )}
                              {user.gender && (
                                <div className="mt-1 inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-gray-400">
                                  {t(`user.field.gender.${user.gender}`)}
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <UserRoleBadge role={user.role} />
                        </TableCell>
                        <TableCell>
                           <div className="flex items-center gap-1 text-xs font-mono text-gray-500 mb-1">
                             {user.wallet_address ? truncateAddress(user.wallet_address) : (
                               <span className="text-sm text-gray-400 italic font-sans">{t("common.notSet")}</span>
                             )}
                             {user.wallet_address && (
                               <CopyInlineButton
                                 value={user.wallet_address}
                                 ariaLabel={t("user.copy.wallet")}
                               />
                             )}
                           </div>
                          <UserStatusBadge deletedAt={user.deleted_at} />
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={t("user.actions.menu")}
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  if (user.deleted_at) {
                                    void (async () => {
                                      const ok = await confirm({
                                        title: t("user.edit.trashed.title"),
                                        description: t("user.edit.trashed.body", {
                                          name: user.name ?? user.email,
                                        }),
                                        confirmLabel: t("user.edit.trashed.action"),
                                        cancelLabel: t("common.cancel"),
                                      });
                                      if (ok) restoreUsers.mutate([user.id]);
                                    })();
                                  } else {
                                    setEditingUser(user);
                                  }
                                }}
                              >
                                <Pencil className="h-4 w-4 mr-2" />
                                {t("common.edit")}
                              </DropdownMenuItem>
                              {currentUser?.role === Role.SUPER_ADMIN &&
                                currentUser.id !== user.id &&
                                user.role !== Role.SUPER_ADMIN &&
                                !user.deleted_at && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      void (async () => {
                                        const ok = await confirm({
                                          title: t("user.transfer.confirm.title", {
                                            name: user.name ?? user.email,
                                          }),
                                          description: t("user.transfer.confirm.body", {
                                            name: user.name ?? user.email,
                                          }),
                                          confirmLabel: t("user.transfer.confirm.action"),
                                          cancelLabel: t("common.cancel"),
                                          tone: "destructive",
                                        });
                                        if (ok) transfer.mutate(user.id);
                                      })();
                                    }}
                                  >
                                    <ArrowRightLeft className="h-4 w-4 mr-2" />
                                    {t("user.transfer.menuLabel")}
                                  </DropdownMenuItem>
                                )}
                              {!user.deleted_at && currentUser?.id !== user.id && (
                                <DropdownMenuItem
                                  destructive
                                  onClick={() => {
                                    void (async () => {
                                      const ok = await confirm({
                                        title: t("user.delete.confirm.title", {
                                          name: user.name ?? user.email,
                                        }),
                                        description: t("user.delete.confirm.body"),
                                        confirmLabel: t("user.delete.confirm.action"),
                                        cancelLabel: t("common.cancel"),
                                        tone: "destructive",
                                      });
                                      if (ok) deleteUsers.mutate([user.id]);
                                    })();
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  {t("user.actions.delete")}
                                </DropdownMenuItem>
                              )}
                              {user.deleted_at && (
                                <DropdownMenuItem
                                  onClick={() => {
                                    void (async () => {
                                      const ok = await confirm({
                                        title: t("user.restore.confirm.title", {
                                          name: user.name ?? user.email,
                                        }),
                                        description: t("user.restore.confirm.body"),
                                        confirmLabel: t("user.restore.confirm.action"),
                                        cancelLabel: t("common.cancel"),
                                      });
                                      if (ok) restoreUsers.mutate([user.id]);
                                    })();
                                  }}
                                >
                                  <RotateCcw className="h-4 w-4 mr-2" />
                                  {t("user.actions.restore")}
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>

            {total > 0 && !isLoading && (
              <div className="flex flex-col gap-3 p-4 sm:p-6 border-t border-gray-50 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-xs text-gray-500 sm:text-sm">
                  {t("user.pagination.showing", {
                    from: Math.min((params.page - 1) * params.limit + 1, total),
                    to: Math.min(params.page * params.limit, total),
                    total,
                    label: t("user.list.count", { count: total }).split(" ").slice(1).join(" "),
                  })}
                </span>
                <div className="flex items-center gap-2 sm:justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={params.page <= 1}
                    onClick={() => setParam("page", params.page - 1)}
                  >
                    {t("common.previous")}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={params.page >= totalPages}
                    onClick={() => setParam("page", params.page + 1)}
                  >
                    {t("common.next")}
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      <UserEditDrawer user={editingUser} onClose={() => setEditingUser(null)} />
      {dialog}

      {!canManageUsers && (
        <p className="text-xs text-gray-400 text-center">
          {t("user.list.roleAdminNotice")}
        </p>
      )}
    </div>
  );
}
