import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { Field, TextArea, TextInput } from "../ui/Form";
import { Modal } from "../ui/Modal";
import { shiftSchema } from "../../validations/schemas";
import { getApiErrorMessage, getFieldErrors } from "../../utils";

export function ShiftFormModal({ open, shift, submitting, onClose, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(shiftSchema),
    defaultValues: { name: "", startTime: "06:00", endTime: "14:00", description: "" },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      shift
        ? { name: shift.name, startTime: shift.startTime, endTime: shift.endTime, description: shift.description ?? "" }
        : { name: "", startTime: "06:00", endTime: "14:00", description: "" },
    );
  }, [open, shift]);

  return (
    <Modal open={open} title={shift ? "Edit shift" : "Add shift"} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            const result = await onSubmit(values);
            toast.success(result.message || "Shift saved.");
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
          <TextInput {...form.register("name")} placeholder="Morning" />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Start time" error={form.formState.errors.startTime?.message}>
            <TextInput type="time" {...form.register("startTime")} />
          </Field>
          <Field label="End time" error={form.formState.errors.endTime?.message}>
            <TextInput type="time" {...form.register("endTime")} />
          </Field>
        </div>
        <Field label="Description" error={form.formState.errors.description?.message}>
          <TextArea {...form.register("description")} />
        </Field>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button className="w-full sm:w-auto" type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button className="w-full sm:w-auto" type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save shift"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
