import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TestProviders } from "@/test/TestProviders";
import { LoadMoreBar } from "./LoadMoreBar";

describe("LoadMoreBar", () => {
  it("renders count label", () => {
    render(
      <LoadMoreBar
        total={42}
        hasMore={true}
        isLoading={false}
        onLoadMore={vi.fn()}
        countLabel="42 Credentials"
      />,
      { wrapper: TestProviders },
    );

    expect(screen.getByText("42 Credentials")).toBeInTheDocument();
  });

  it("renders Load More button when hasMore is true", () => {
    render(
      <LoadMoreBar
        total={50}
        hasMore={true}
        isLoading={false}
        onLoadMore={vi.fn()}
        countLabel="50 Users"
      />,
      { wrapper: TestProviders },
    );

    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("hides Load More button when hasMore is false", () => {
    render(
      <LoadMoreBar
        total={23}
        hasMore={false}
        isLoading={false}
        onLoadMore={vi.fn()}
        countLabel="23 Credentials"
      />,
      { wrapper: TestProviders },
    );

    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("disables button when loading", () => {
    render(
      <LoadMoreBar
        total={100}
        hasMore={true}
        isLoading={true}
        onLoadMore={vi.fn()}
        countLabel="100 Credentials"
      />,
      { wrapper: TestProviders },
    );

    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("calls onLoadMore when button is clicked", async () => {
    const onLoadMore = vi.fn();
    const user = userEvent.setup();

    render(
      <LoadMoreBar
        total={60}
        hasMore={true}
        isLoading={false}
        onLoadMore={onLoadMore}
        countLabel="60 Credentials"
      />,
      { wrapper: TestProviders },
    );

    await user.click(screen.getByRole("button"));
    expect(onLoadMore).toHaveBeenCalledOnce();
  });
});
