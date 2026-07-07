import { describe, expect, it, vi } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { server } from "@/test/msw/server";
import { TestProviders } from "@/test/TestProviders";
import { useIssueCredentials } from "./useIssueCredentials";
import type { UseFormReturn, FieldValues } from "react-hook-form";

function createFormMock(): UseFormReturn<FieldValues> {
  return {
    setError: vi.fn(),
    clearErrors: vi.fn(),
    setValue: vi.fn(),
    getValues: vi.fn(),
    register: vi.fn(),
    unregister: vi.fn(),
    handleSubmit: vi.fn(),
    watch: vi.fn(),
    reset: vi.fn(),
    resetField: vi.fn(),
    setFocus: vi.fn(),
    trigger: vi.fn(),
    formState: {
      isDirty: false,
      dirtyFields: {},
      isSubmitted: false,
      isSubmitSuccessful: false,
      submitCount: 0,
      touchedFields: {},
      errors: {},
      isValidating: false,
      isValid: true,
      defaultValues: {},
    },
    control: {} as UseFormReturn<FieldValues>["control"],
    getFieldState: vi.fn(),
  } as unknown as UseFormReturn<FieldValues>;
}

describe("useIssueCredentials", () => {
  it("sets server errors on validation failure", async () => {
    server.use(
      http.post("*/api/credentials/batch/issue", () => {
        return HttpResponse.json(
          {
            code: 100040,
            message: "system.validation",
            errors: {
              "credentials[0].name": ["credential.nameRequired"],
            },
          },
          { status: 422 },
        );
      }),
    );

    const form = createFormMock();
    const { result } = renderHook(() => useIssueCredentials(form), {
      wrapper: TestProviders,
    });

    result.current.mutate([
      { holder_user_id: "usr_01", name: "whatever", meta_entries: [], file: null },
    ]);

    await waitFor(() => {
      expect(form.setError).toHaveBeenCalledWith(
        "credentials[0].name",
        expect.objectContaining({ type: "server", message: "credential.nameRequired" }),
      );
    });

    expect(result.current.isError).toBe(true);
  });

  it("shows success on valid input", async () => {
    const form = createFormMock();
    const { result } = renderHook(() => useIssueCredentials(form), {
      wrapper: TestProviders,
    });

    result.current.mutate([{ holder_user_id: "usr_01", name: "OK", meta_entries: [], file: null }]);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
