import type { FieldValues, Path, UseFormReturn } from "react-hook-form";

/**
 * Apply backend validation errors to a React Hook Form instance.
 *
 * Backend returns errors as { field: string[] } where each array contains
 * one or more already-localized messages (server resolves locale via
 * Accept-Language header). We take the first message per field.
 *
 * Field paths use dot notation matching the JSON request shape, e.g.
 * "users.0.email" — RHF accepts these directly.
 */
export function setServerErrors<T extends FieldValues>(
  form: UseFormReturn<T>,
  errors: Record<string, string[]>,
) {
  Object.entries(errors).forEach(([path, messages]) => {
    const message = Array.isArray(messages) ? messages[0] : String(messages);
    if (!message) return;
    form.setError(path as Path<T>, {
      type: "server",
      message,
    });
  });
}
