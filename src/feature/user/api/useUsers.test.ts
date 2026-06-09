import { describe, it, expect } from "vitest";

function buildQuery(params: {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: "asc" | "desc";
  deleted?: "all" | "only" | "none";
}) {
  const q: Record<string, unknown> = {};
  if (params.page) q.page = params.page;
  if (params.limit) q.limit = params.limit;
  if (params.search) q.search = params.search;

  const sorts: string[] = [];
  if (params.sort && params.order) {
    sorts.push(params.order === "desc" ? `-${params.sort}` : params.sort);
  }
  if (sorts.length) q.sorts = sorts;

  const filters: string[] = [];
  if (params.deleted === "only") filters.push("deleted_at!_");
  else if (params.deleted === "none") filters.push("deleted_at_");
  if (filters.length) q.filters = filters;

  return q;
}

describe("useUsers query builder", () => {
  it("deleted=all sends no filter", () => {
    const q = buildQuery({ deleted: "all" });
    expect(q.filters).toBeUndefined();
  });

  it("deleted=only sends deleted_at!_ operator", () => {
    const q = buildQuery({ deleted: "only" });
    expect(q.filters).toEqual(["deleted_at!_"]);
  });

  it("deleted=none sends deleted_at_ operator", () => {
    const q = buildQuery({ deleted: "none" });
    expect(q.filters).toEqual(["deleted_at_"]);
  });

  it("sort=name order=asc sends sorts array", () => {
    const q = buildQuery({ sort: "name", order: "asc" });
    expect(q.sorts).toEqual(["name"]);
  });

  it("sort=name order=desc sends sorts array", () => {
    const q = buildQuery({ sort: "name", order: "desc" });
    expect(q.sorts).toEqual(["-name"]);
  });

  it("combines page + limit + search", () => {
    const q = buildQuery({ page: 2, limit: 50, search: "alice" });
    expect(q.page).toBe(2);
    expect(q.limit).toBe(50);
    expect(q.search).toBe("alice");
  });
});
