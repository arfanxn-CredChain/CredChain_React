import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Pencil,
  UserCircle,
  MoreVertical,
  Eye,
  ArrowRightLeft,
  Trash2,
  RotateCcw,
  Calendar,
} from "lucide-react";
import { useLoadMore } from "@shared/hooks/useLoadMore";
import { api } from "@shared/api/client";
import { useTransferSuperAdmin } from "./api/useTransferSuperAdmin";
import { useDeleteUsers } from "./api/useDeleteUsers";
import { useRestoreUsers } from "./api/useRestoreUsers";
import { useStore } from "@app/store";
import { Role, canAccessAny, canDeleteUser, canEditUser, canTransferTo } from "@shared/auth/role";
import { useDebouncedValue } from "@shared/hooks/useDebouncedValue";
import { useUserListParams } from "./hooks/useUserListParams";
import { cn } from "@shared/lib/cn";
import { useConfirm } from "@ui/confirm-dialog";
import type { UserDTO } from "@shared/types/api";

import { PageHeader } from "@shared/components/PageHeader";
import { EmptyState } from "@shared/components/EmptyState";
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/table";

import { SortMenu } from "./components/SortMenu";
import { RoleFilterMenu } from "./components/RoleFilterMenu";
import { StatusFilterMenu } from "./components/StatusFilterMenu";
import { LoadMoreBar } from "@shared/components/LoadMoreBar";
import { UserEditDrawer } from "./components/UserEditDrawer";
import { UserContactBlock } from "@shared/components/UserContactBlock";
import { relativeTime } from "@shared/lib/format";

export function UserList() {
  const { t, i18n } = useTranslation();
  const { params, setParam } = useUserListParams();
  const [inputValue, setInputValue] = useState(params.search);
  const searchTypedRef = useRef<string | null>(null);
  const debouncedSearch = useDebouncedValue(inputValue, 300);
  const [editingUser, setEditingUser] = useState<UserDTO | null>(null);

  useEffect(() => {
    if (params.search !== searchTypedRef.current) {
      searchTypedRef.current = null;
      setInputValue(params.search);
    }
  }, [params.search]);
  const transfer = useTransferSuperAdmin();
  const deleteUsers = useDeleteUsers();
  const restoreUsers = useRestoreUsers();
  const { confirm, dialog } = useConfirm();

  const currentUser = useStore((s) => s.user);
  const canManageUsers = canAccessAny(currentUser?.role, [Role.ADMIN, Role.SUPER_ADMIN]);
  const navigate = useNavigate();

  const sortArray = params.sort ? [params.sort] : ["-updated_at"];
  const filterArray: string[] = [];
  if (params.role !== "all") filterArray.push(`role=${params.role}`);
  if (params.status === "deleted_at!_") filterArray.push("deleted_at!_");
  else if (params.status === "deleted_at_") filterArray.push("deleted_at_");

  const { items: users, total, isLoading, isError, isFetchingNextPage, hasMore, loadMore } =
    useLoadMore<UserDTO>(
      ["users", { search: debouncedSearch || undefined, sorts: sortArray, filters: filterArray }],
      async (page, limit) => {
        const q: Record<string, unknown> = {};
        q.page = page;
        q.limit = limit;
        if (debouncedSearch) q.search = debouncedSearch;
        q.sorts = sortArray;
        if (filterArray.length > 0) q.filters = filterArray;
        const response = await api.get("/users", { params: q });
        return response.data;
      },
    );

  const isEmpty = !isLoading && users.length === 0;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
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
        <div className="border-b border-gray-50 p-4 sm:p-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
            <div className="w-full md:max-w-md md:flex-1">
              <Input
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoCorrect="off"
                autoComplete="off"
                spellCheck={false}
                leadingIcon={Search}
                placeholder={t("user.list.searchPlaceholder")}
                value={inputValue}
                onChange={(e) => {
                  setInputValue(e.target.value);
                  searchTypedRef.current = e.target.value;
                  setParam("search", e.target.value);
                }}
                aria-label={t("user.list.searchPlaceholder")}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2 md:ml-auto md:shrink-0">
              <RoleFilterMenu value={params.role} onChange={(r) => setParam("role", r)} />
              <StatusFilterMenu value={params.status} onChange={(v) => setParam("status", v)} />
              <SortMenu
                value={params.sort}
                onChange={(sortString) => setParam("sort", sortString)}
              />
            </div>
          </div>
        </div>

        {isError ? (
          <div className="p-12 text-center text-sm text-error">{t("user.list.error")}</div>
        ) : isEmpty ? (
          <EmptyState
            icon={UserCircle}
            title={
              debouncedSearch ? t("user.list.empty.search.title") : t("user.list.empty.none.title")
            }
            description={
              debouncedSearch ? t("user.list.empty.search.body") : t("user.list.empty.none.body")
            }
            className="rounded-none border-0 shadow-none"
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("user.column.entity")}</TableHead>
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
                            <div className="flex items-start gap-3">
                              <Skeleton className="h-10 w-10 shrink-0 rounded-full" />
                              <div className="min-w-0 flex-1 space-y-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-3 w-40" />
                                <Skeleton className="h-3 w-24" />
                                <Skeleton className="h-3 w-36" />
                                <Skeleton className="h-3 w-28" />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Skeleton className="ml-auto h-4 w-16" />
                          </TableCell>
                        </TableRow>
                      ))
                    : users.map((user) => (
                        <TableRow
                          key={user.id}
                          className={cn("cursor-pointer", user.deleted_at && "bg-error/5")}
                        >
                          <TableCell>
                            <div className="min-w-0">
                              <UserContactBlock
                                labelType="full"
                                user={user}
                                fallbackId={user.id}
                                copyPrefix="user"
                                blockLinks
                              />
                              <div className="ml-13 mt-1 flex items-center gap-1.5 text-xs text-gray-500">
                                <Calendar className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
                                <span>
                                  {user.deleted_at
                                    ? t("user.list.trashed", {
                                        time: relativeTime(user.deleted_at, i18n.language),
                                      })
                                    : user.updated_at !== user.created_at
                                      ? t("user.list.updated", {
                                          time: relativeTime(user.updated_at, i18n.language),
                                        })
                                      : t("user.list.created", {
                                          time: relativeTime(user.created_at, i18n.language),
                                        })}
                                </span>
                              </div>
                            </div>
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
                                <DropdownMenuItem onClick={() => navigate(`/users/${user.id}`)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  {t("common.view")}
                                </DropdownMenuItem>
                                {currentUser && canEditUser(currentUser, user) && (
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
                                    <Pencil className="mr-2 h-4 w-4" />
                                    {t("common.edit")}
                                  </DropdownMenuItem>
                                )}
                                {currentUser && canTransferTo(currentUser, user) && (
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
                                    <ArrowRightLeft className="mr-2 h-4 w-4" />
                                    {t("user.transfer.menuLabel")}
                                  </DropdownMenuItem>
                                )}
                                {currentUser &&
                                  canDeleteUser(currentUser, user) &&
                                  !user.deleted_at && (
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
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      {t("user.actions.delete")}
                                    </DropdownMenuItem>
                                  )}
                                {canManageUsers && user.deleted_at && (
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
                                    <RotateCcw className="mr-2 h-4 w-4" />
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
            </div>

            {total > 0 && (
              <LoadMoreBar
                total={total}
                hasMore={hasMore}
                isLoading={isFetchingNextPage}
                onLoadMore={loadMore}
                countLabel={t("user.list.footerCount", { count: total })}
              />
            )}
          </>
        )}
      </Card>

      <UserEditDrawer user={editingUser} onClose={() => setEditingUser(null)} />
      {dialog}

      {!canManageUsers && (
        <p className="text-center text-xs text-gray-400">{t("user.list.roleAdminNotice")}</p>
      )}
    </div>
  );
}
