import { describe, it, expect, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { RootRedirect } from "./RootRedirect";
import { useStore } from "@app/store";

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/dashboard" element={<div>Dashboard</div>} />
        <Route path="/login" element={<div>Login</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RootRedirect", () => {
  beforeEach(() => {
    useStore.setState({ user: null, isAuthenticated: false });
  });

  it("redirects authenticated users to /dashboard", () => {
    useStore.setState({
      user: { id: "1", email: "a@b.com" } as never,
      isAuthenticated: true,
    });
    const { getByText } = renderAt("/");
    expect(getByText("Dashboard")).toBeInTheDocument();
  });

  it("redirects unauthenticated users to /login", () => {
    useStore.setState({ user: null, isAuthenticated: false });
    const { getByText } = renderAt("/");
    expect(getByText("Login")).toBeInTheDocument();
  });
});
