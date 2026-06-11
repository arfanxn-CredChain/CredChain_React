import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { OfflineBanner } from "./OfflineBanner";

vi.mock("@shared/i18n/config", async () => {
  const actual = await vi.importActual("@shared/i18n/config");
  return {
    ...(actual as Record<string, unknown>),
    i18n: {
      ...((actual as Record<string, unknown>).i18n as Record<string, unknown>),
      t: (key: string) => {
        const map: Record<string, string> = {
          "offline.banner":
            "You are currently offline. Some actions may fail until connection is restored.",
        };
        return map[key] ?? key;
      },
    },
  };
});

describe("OfflineBanner", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("renders nothing when online", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    const { container } = render(<OfflineBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("renders banner when offline", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    window.dispatchEvent(new Event("offline"));
    render(<OfflineBanner />);
    expect(screen.getByText(/offline/i)).toBeDefined();
  });

  it("has error background color", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    window.dispatchEvent(new Event("offline"));
    const { container } = render(<OfflineBanner />);
    const banner = container.firstElementChild;
    expect(banner?.className).toContain("bg-error");
  });

  it("has shadow-error/20 tint", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    window.dispatchEvent(new Event("offline"));
    const { container } = render(<OfflineBanner />);
    const banner = container.firstElementChild;
    expect(banner?.className).toContain("shadow-error/20");
  });

  it("uses fixed positioning", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    window.dispatchEvent(new Event("offline"));
    const { container } = render(<OfflineBanner />);
    const banner = container.firstElementChild;
    expect(banner?.className).toContain("fixed");
  });
});
