import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { Field, TextArea, TextInput } from "../ui/Form";
import { Modal } from "../ui/Modal";
import { namedEntitySchema } from "../../validations/schemas";
import { getApiErrorMessage, getFieldErrors } from "../../utils";

export function NamedEntityFormModal({ open, title, initial, submitting, onClose, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(namedEntitySchema),
    defaultValues: { name: "", description: "" },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(initial ?? { name: "", description: "" });
  }, [open]);

  return (
    <Modal open={open} title={title} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            const result = await onSubmit(values);
            toast.success(result?.message || "Saved successfully.");
            onClose();
          } catch (error) {
            Object.entries(getFieldErrors(error)).forEach(([name, message]) => {
              form.setError(name, { message });
            });
            toast.error(getApiErrorMessage(error));
          }
        })}
      >
        <Field label="Name" error={form.formState.errors.name?.message}>
          <TextInput {...form.register("name")} placeholder="e.g. Front Office" />
        </Field>
        <Field label="Description" error={form.formState.errors.description?.message}>
          <TextArea {...form.register("description")} placeholder="Optional short description" />
        </Field>
        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
          <Button className="w-full sm:w-auto" type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button className="w-full sm:w-auto" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
