import { describe, it, expect, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TestProviders } from "@/test/TestProviders";
import { i18n } from "@shared/i18n/config";
import { MetaEditor } from "./MetaEditor";
import { metaEntriesSchema } from "../schemas/user";
import { z } from "zod";

function Harness({
  defaultValues = { meta_entries: [] } as { meta_entries: { key: string; value: string }[] },
}: {
  defaultValues?: { meta_entries: { key: string; value: string }[] };
}) {
  const form = useForm({ defaultValues });
  return <MetaEditor control={form.control} />;
}

const validatedFormSchema = z.object({ meta_entries: metaEntriesSchema });

function ValidatedHarness({
  defaultValues,
}: {
  defaultValues: { meta_entries: { key: string; value: string }[] };
}) {
  const form = useForm({
    defaultValues,
    resolver: zodResolver(validatedFormSchema),
    mode: "onChange",
  });
  // Subscribe to formState.errors so a re-render fires after validation
  // (MetaEditor reads control._formState directly, which doesn't subscribe)
  const _ = form.formState.errors;
  void _;
  return (
    <form onSubmit={form.handleSubmit(() => {})}>
      <MetaEditor control={form.control} />
      <button type="submit">submit</button>
    </form>
  );
}

describe("MetaEditor", () => {
  beforeEach(() => {
    void i18n.changeLanguage("en");
  });

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
    render(<Harness defaultValues={{ meta_entries: [{ key: "k1", value: "v1" }] }} />, {
      wrapper: TestProviders,
    });
    expect(screen.getAllByRole("textbox")).toHaveLength(2);
    await userEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(screen.queryAllByRole("textbox")).toHaveLength(0);
  });

  it("shows translated error message (not raw key) when key is empty", async () => {
    render(<ValidatedHarness defaultValues={{ meta_entries: [{ key: "", value: "v1" }] }} />, {
      wrapper: TestProviders,
    });
    await userEvent.click(screen.getByRole("button", { name: /submit/i }));
    await waitFor(() => {
      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByRole("alert").textContent).toBe("Key required");
      expect(screen.queryByText("zod.meta.keyRequired")).not.toBeInTheDocument();
    });
  });
});
