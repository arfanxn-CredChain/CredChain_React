import { Plus, X } from "lucide-react";
import { useFieldArray, type Control, type FieldValues } from "react-hook-form";
import { Button } from "@ui/button";
import { Input } from "@ui/input";
import { Label } from "@ui/label";

interface MetaEditorProps<T extends FieldValues> {
  control: Control<T>;
  name?: string;
}

export function MetaEditor<T extends FieldValues>({
  control,
  name = "meta_entries",
}: MetaEditorProps<T>) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: name as never,
  });

  const errors = (control._formState.errors as Record<string, unknown>)[name] as
    | { [k: number]: { key?: { message?: string }; value?: { message?: string } } }
    | undefined;

  return (
    <div className="space-y-3">
      <Label>Meta (custom fields)</Label>
      <div className="space-y-2">
        {fields.length === 0 && (
          <p className="text-xs text-gray-400 italic">
            No custom fields. Click Add field to get started.
          </p>
        )}
        {fields.map((field, idx) => {
          const keyError = errors?.[idx]?.key?.message;
          const valueError = errors?.[idx]?.value?.message;
          return (
            <div key={field.id} className="flex items-start gap-2">
              <div className="flex-1">
                <Input
                  placeholder="Key"
                  aria-label={`Meta key ${idx + 1}`}
                  {...control.register(`${name}.${idx}.key` as never)}
                />
                {keyError && (
                  <p className="text-xs text-error mt-1" role="alert">
                    {keyError}
                  </p>
                )}
              </div>
              <div className="flex-1">
                <Input
                  placeholder="Value"
                  aria-label={`Meta value ${idx + 1}`}
                  {...control.register(`${name}.${idx}.value` as never)}
                />
                {valueError && (
                  <p className="text-xs text-error mt-1" role="alert">
                    {valueError}
                  </p>
                )}
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(idx)}
                aria-label={`Remove field ${idx + 1}`}
                className="h-10 w-10 mt-0.5"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
        <Button
          type="button"
          variant="outline"
          onClick={() => append({ key: "", value: "" } as never)}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add field
        </Button>
      </div>
    </div>
  );
}
