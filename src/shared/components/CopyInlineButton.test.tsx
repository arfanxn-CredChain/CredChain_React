import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestProviders } from "@/test/TestProviders";
import { i18n } from "@shared/i18n/config";
import { CopyInlineButton } from "./CopyInlineButton";

describe("CopyInlineButton", () => {
  beforeEach(async () => {
    await i18n.changeLanguage("en");
  });

  it("renders with the provided aria-label", () => {
    render(
      <CopyInlineButton value="test@example.com" ariaLabel="Copy email" />,
      { wrapper: TestProviders },
    );
    expect(screen.getByRole("button", { name: /copy email/i })).toBeInTheDocument();
  });

  it("copies the value to clipboard when clicked", async () => {
    const user = userEvent.setup();
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    });

    render(
      <CopyInlineButton value="test@example.com" ariaLabel="Copy email" />,
      { wrapper: TestProviders },
    );

    await user.click(screen.getByRole("button", { name: /copy email/i }));
    expect(writeTextMock).toHaveBeenCalledWith("test@example.com");
  });

  it("shows checkmark after successful copy", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });

    render(
      <CopyInlineButton value="test@example.com" ariaLabel="Copy email" />,
      { wrapper: TestProviders },
    );

    await user.click(screen.getByRole("button", { name: /copy email/i }));
    await waitFor(() => {
      expect(screen.getByRole("button", { name: /copied/i })).toBeInTheDocument();
    });
  });

  it("calls stopPropagation on click event", async () => {
    const user = userEvent.setup();
    const parentClick = vi.fn();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      writable: true,
      configurable: true,
    });

    render(
      <div onClick={parentClick}>
        <CopyInlineButton value="test" ariaLabel="Copy" />
      </div>,
      { wrapper: TestProviders },
    );

    await user.click(screen.getByRole("button", { name: /copy/i }));
    expect(parentClick).not.toHaveBeenCalled();
  });
});
