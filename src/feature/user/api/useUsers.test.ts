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
  if (params.sort && params.order) {
    q.sort = params.order === "desc" ? `-${params.sort}` : params.sort;
  }
  if (params.deleted === "only") q["deleted_at!_"] = "";
  else if (params.deleted === "none") q["deleted_at_"] = "";
  return q;
}

describe("useUsers query builder", () => {
  it("deleted=all sends no filter", () => {
    const q = buildQuery({ deleted: "all" });
    expect(q["deleted_at!_"]).toBeUndefined();
    expect(q["deleted_at_"]).toBeUndefined();
  });

  it("deleted=only sends deleted_at!_ operator", () => {
    const q = buildQuery({ deleted: "only" });
    expect(q["deleted_at!_"]).toBe("");
  });

  it("deleted=none sends deleted_at_ operator", () => {
    const q = buildQuery({ deleted: "none" });
    expect(q["deleted_at_"]).toBe("");
  });

  it("sort=name order=asc sends sort=name", () => {
    const q = buildQuery({ sort: "name", order: "asc" });
    expect(q.sort).toBe("name");
  });

  it("sort=name order=desc sends sort=-name", () => {
    const q = buildQuery({ sort: "name", order: "desc" });
    expect(q.sort).toBe("-name");
  });

  it("combines page + limit + search", () => {
    const q = buildQuery({ page: 2, limit: 50, search: "alice" });
    expect(q.page).toBe(2);
    expect(q.limit).toBe(50);
    expect(q.search).toBe("alice");
  });
});
