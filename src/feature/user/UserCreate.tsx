import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { Plus, Save } from "lucide-react";

import { PageHeader } from "@shared/components/PageHeader";
import { Button } from "@ui/button";
import { Card } from "@ui/card";

import { useCreateUsers } from "./api/useCreateUsers";
import {
  type UserBatchStoreInput,
  defaultUserStoreRow,
  userBatchStoreSchema,
} from "./schemas/user";
import { UserCreateRow } from "./components/UserCreateRow";

export function UserCreate() {
  const navigate = useNavigate();

  const form = useForm<UserBatchStoreInput>({
    resolver: zodResolver(userBatchStoreSchema),
    defaultValues: { users: [defaultUserStoreRow()] },
    mode: "onBlur",
  });

  const createUsers = useCreateUsers(form);
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "users",
  });

  const onSubmit = form.handleSubmit((data) => {
    createUsers.mutate(data, {
      onSuccess: () => navigate("/users"),
    });
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <PageHeader
        title="Register New Entities"
        description="Add multiple users and assign their network roles."
        onBack={() => navigate("/users")}
      />

      <Card className="p-0">
        <form onSubmit={onSubmit} className="p-6 sm:p-8 space-y-8">
          <div className="space-y-6">
            {fields.map((field, index) => (
              <UserCreateRow
                key={field.id}
                index={index}
                form={form}
                onRemove={fields.length > 1 ? () => remove(index) : undefined}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-6 border-t border-gray-100">
            <Button
              type="button"
              variant="dashed"
              onClick={() => append(defaultUserStoreRow())}
              disabled={fields.length >= 100}
            >
              <Plus className="h-4 w-4" />
              Add another entity
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={createUsers.isPending}
            >
              <Save className="h-5 w-5" />
              {createUsers.isPending ? "Registering..." : "Register Entities"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
