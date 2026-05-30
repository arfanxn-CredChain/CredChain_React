import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmDialog } from "./confirm-dialog";

describe("ConfirmDialog keyboard shortcuts", () => {
  it("Enter triggers onConfirm when dialog is open", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Test"
        description="Test"
        confirmLabel="OK"
        cancelLabel="Cancel"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    await userEvent.keyboard("{Enter}");
    expect(onConfirm).toHaveBeenCalled();
  });

  it("Esc triggers onCancel when dialog is open", async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        open
        title="Test"
        description="Test"
        confirmLabel="OK"
        cancelLabel="Cancel"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );
    await userEvent.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalled();
  });

  it("Confirm button autofocused on open", () => {
    render(
      <ConfirmDialog
        open
        title="Test"
        description="Test"
        confirmLabel="OK"
        cancelLabel="Cancel"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByRole("button", { name: "OK" })).toHaveFocus();
  });
});
