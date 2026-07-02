import { describe, expect, it, vi, beforeEach } from "vitest";
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
  beforeEach(() => {
    server.use(
      http.post("*/api/credentials/batch/issue", async ({ request }) => {
        const body = await request.formData();
        const name = body.get("items[0][name]");
        if (name === "fail") {
          return HttpResponse.json(
            {
              code: 400200,
              message: "Partial success",
              data: [],
              errors: {
                "items[0].Name": ["credential.nameRequired"],
              },
            },
            { status: 200 },
          );
        }
        return HttpResponse.json({
          code: 400200,
          message: "Credential(s) issued successfully",
          data: [
            {
              id: "cred_NEW1",
              holder_user_id: "usr_01",
              issuer_user_id: "usr_02",
              revoker_user_id: null,
              name: "New Certificate",
              meta: null,
              token_id: "123458",
              file_hash: "0xnewhash1",
              file_uri: "local:///uploads/new.pdf",
              extract_status: "pending",
              extract_error: null,
              extracted_at: null,
              issued_at: new Date().toISOString(),
              revoked_at: null,
            },
          ],
        });
      }),
    );
  });

  it("returns fieldErrors from response envelope when errors present", async () => {
    const form = createFormMock();
    const { result } = renderHook(() => useIssueCredentials(form), {
      wrapper: TestProviders,
    });

    result.current.mutate([
      { holder_user_id: "usr_01", name: "fail", meta_entries: [], file: null },
    ]);

    await waitFor(() => {
      expect(form.setError).toHaveBeenCalledWith(
        "items[0].name",
        expect.objectContaining({ type: "server", message: "credential.nameRequired" }),
      );
    });
  });

  it("shows success toast when no field errors", async () => {
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
