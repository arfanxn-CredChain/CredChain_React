import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { UserAvatar } from "./UserAvatar";
import { mockUserWithMeta } from "@/test/fixtures";

describe("UserAvatar", () => {
  it("renders fallback icon when user is null", () => {
    const { container } = render(<UserAvatar user={null} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("generates SVG data URI for valid user", () => {
    const user = mockUserWithMeta({ wallet_address: "0xabc123" });
    render(<UserAvatar user={user} />);
    const img = screen.getByRole("presentation") as HTMLImageElement;
    expect(img.src).toMatch(/^data:image\/svg\+xml/);
  });

  it("same seed produces same data URI (memoized)", () => {
    const user = mockUserWithMeta({ wallet_address: "0xdead" });
    const { rerender, container } = render(<UserAvatar user={user} />);
    const firstSrc = (container.querySelector("img") as HTMLImageElement).src;
    rerender(<UserAvatar user={user} />);
    const secondSrc = (container.querySelector("img") as HTMLImageElement).src;
    expect(firstSrc).toBe(secondSrc);
  });

  it("different seeds produce different URIs", () => {
    const u1 = mockUserWithMeta({ id: "u1", wallet_address: "0xa" });
    const u2 = mockUserWithMeta({ id: "u2", wallet_address: "0xb" });
    const { container, rerender } = render(<UserAvatar user={u1} />);
    const src1 = (container.querySelector("img") as HTMLImageElement).src;
    rerender(<UserAvatar user={u2} />);
    const src2 = (container.querySelector("img") as HTMLImageElement).src;
    expect(src1).not.toBe(src2);
  });

  it("falls back to id when wallet_address missing", () => {
    const user = mockUserWithMeta({ wallet_address: "", id: "fallback-id" });
    render(<UserAvatar user={user} />);
    expect(screen.getByRole("presentation")).toBeInTheDocument();
  });

  it("alt is empty for decorative usage", () => {
    const user = mockUserWithMeta();
    render(<UserAvatar user={user} />);
    const img = screen.getByRole("presentation") as HTMLImageElement;
    expect(img.alt).toBe("");
  });

  it("size sm renders 24px", () => {
    const user = mockUserWithMeta();
    const { container } = render(<UserAvatar user={user} size="sm" />);
    const img = container.querySelector("img") as HTMLImageElement;
    expect(img.style.width).toBe("24px");
  });

  it("size xl renders 96px", () => {
    const user = mockUserWithMeta();
    const { container } = render(<UserAvatar user={user} size="xl" />);
    const img = container.querySelector("img") as HTMLImageElement;
    expect(img.style.width).toBe("96px");
  });
});
