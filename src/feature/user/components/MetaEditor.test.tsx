import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { TestProviders } from "@/test/TestProviders";
import { MetaEditor } from "./MetaEditor";

function Harness({
  defaultValues = { meta_entries: [] } as { meta_entries: { key: string; value: string }[] },
}: {
  defaultValues?: { meta_entries: { key: string; value: string }[] };
}) {
  const form = useForm({ defaultValues });
  return <MetaEditor control={form.control} />;
}

describe("MetaEditor", () => {
  it("renders Add Field button when empty", () => {
    render(<Harness />, { wrapper: TestProviders });
    expect(screen.getByRole("button", { name: /add field/i })).toBeInTheDocument();
  });

  it("clicking Add Field appends a row with two inputs", async () => {
    render(<Harness />, { wrapper: TestProviders });
    await userEvent.click(screen.getByRole("button", { name: /add field/i }));
    const inputs = screen.getAllByRole("textbox");
    expect(inputs.length).toBeGreaterThanOrEqual(2);
  });

  it("clicking remove drops the row", async () => {
    render(
      <Harness defaultValues={{ meta_entries: [{ key: "k1", value: "v1" }] }} />,
      { wrapper: TestProviders },
    );
    expect(screen.getAllByRole("textbox")).toHaveLength(2);
    await userEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
  });
});
