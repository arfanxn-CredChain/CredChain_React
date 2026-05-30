import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestProviders } from "@/test/TestProviders";
import { UserSelfEmail } from "./UserSelfEmail";
import { useStore } from "@app/store";
import { mockUserWithMeta } from "@/test/fixtures";

const mockMutate = vi.fn();
vi.mock("./api/useUpdateSelfEmail", () => ({
  useUpdateSelfEmail: () => ({ mutate: mockMutate, isPending: false }),
}));

vi.mock("@react-oauth/google", () => ({
  GoogleLogin: ({ onSuccess }: { onSuccess: (r: { credential: string }) => void }) => (
    <button
      type="button"
      onClick={() => onSuccess({
        // header.payload.signature where payload base64 = {"email":"new@example.com"}
        credential: "header.eyJlbWFpbCI6Im5ld0BleGFtcGxlLmNvbSJ9.signature",
      })}
    >
      Mock Google Login
    </button>
  ),
}));

describe("UserSelfEmail", () => {
  beforeEach(() => {
    mockMutate.mockClear();
    useStore.setState({
      user: mockUserWithMeta({ email: "old@example.com" }),
      isAuthenticated: true,
    });
  });

  it("renders single Google sign-in button (no email text input)", () => {
    render(<UserSelfEmail />, { wrapper: TestProviders });
    expect(screen.queryByPlaceholderText(/new@example.com/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Mock Google Login/i)).toBeInTheDocument();
  });

  it("shows current email read-only", () => {
    render(<UserSelfEmail />, { wrapper: TestProviders });
    const current = screen.getByDisplayValue("old@example.com") as HTMLInputElement;
    expect(current.readOnly).toBe(true);
  });

  it("on Google success, opens confirm dialog with decoded email", async () => {
    render(<UserSelfEmail />, { wrapper: TestProviders });
    await userEvent.click(screen.getByText(/Mock Google Login/i));
    expect(await screen.findByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText(/new@example.com/i)).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it("calls mutate on confirm with decoded email", async () => {
    render(<UserSelfEmail />, { wrapper: TestProviders });
    await userEvent.click(screen.getByText(/Mock Google Login/i));
    const dialog = await screen.findByRole("alertdialog");
    const buttons = dialog.querySelectorAll("button");
    await userEvent.click(buttons[1]);
    expect(mockMutate).toHaveBeenCalledWith(
      expect.objectContaining({ email: "new@example.com" }),
    );
  });

  it("does not mutate on cancel", async () => {
    render(<UserSelfEmail />, { wrapper: TestProviders });
    await userEvent.click(screen.getByText(/Mock Google Login/i));
    await screen.findByRole("alertdialog");
    await userEvent.keyboard("{Escape}");
    expect(mockMutate).not.toHaveBeenCalled();
  });
});