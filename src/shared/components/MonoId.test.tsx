import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MonoId } from "./MonoId";

describe("MonoId", () => {
  it("renders a hash-truncated value by default", () => {
    render(<MonoId value="01J8K2M3N4P5Q6R7S8T9U0V1W" />);
    expect(screen.getByText("01J8K2M3N4P5Q6R7...")).toBeInTheDocument();
  });

  it("renders a full value in full mode", () => {
    render(<MonoId value="01J8K2M3N4P5Q6R7S8T9U0V1W" mode="full" />);
    expect(screen.getByText("01J8K2M3N4P5Q6R7S8T9U0V1W")).toBeInTheDocument();
  });

  it("renders an address-style truncated value in address mode", () => {
    render(<MonoId value="0x1234567890123456789012345678901234567890" mode="address" />);
    expect(screen.getByText("0x12345678...7890")).toBeInTheDocument();
  });

  it("renders an id-style truncated value in id mode", () => {
    render(<MonoId value="01J8K2M3N4P5Q6R7S8T9U0V1W" mode="id" />);
    expect(screen.getByText("01J8K2M3N4...0V1W")).toBeInTheDocument();
  });
});
