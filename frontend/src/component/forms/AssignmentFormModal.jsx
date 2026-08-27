import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { Field, SelectInput, TextArea, TextInput } from "../ui/Form";
import { Modal } from "../ui/Modal";
import { assignmentSchema } from "../../validations/schemas";
import { fullName, getApiErrorMessage, getFieldErrors, todayIso } from "../../utils";

export function AssignmentFormModal({ open, employees, shifts, submitting, onClose, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(assignmentSchema),
    defaultValues: { employeeId: "", shiftId: "", date: todayIso(), notes: "" },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ employeeId: "", shiftId: "", date: todayIso(), notes: "" });
  }, [open]);

  return (
    <Modal open={open} title="Assign shift" onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            const result = await onSubmit(values);
            toast.success(result.message || "Shift assigned.");
            onClose();
          } catch (error) {
            Object.entries(getFieldErrors(error)).forEach(([name, message]) => {
              form.setError(name, { message });
            });
            toast.error(getApiErrorMessage(error));
          }
        })}
      >
        <Field label="Employee" error={form.formState.errors.employeeId?.message}>
          <SelectInput {...form.register("employeeId")}>
            <option value="">Select employee</option>
            {employees
              .filter((item) => item.status === "ACTIVE")
              .map((item) => (
                <option key={item.id} value={item.id}>
                  {fullName(item)} — {item.department.name}
                </option>
              ))}
          </SelectInput>
        </Field>
        <Field label="Shift" error={form.formState.errors.shiftId?.message}>
          <SelectInput {...form.register("shiftId")}>
            <option value="">Select shift</option>
            {shifts.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} ({item.startTime}–{item.endTime})
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Date" error={form.formState.errors.date?.message}>
          <TextInput type="date" {...form.register("date")} />
        </Field>
        <Field label="Notes" error={form.formState.errors.notes?.message}>
          <TextArea {...form.register("notes")} placeholder="Optional" />
        </Field>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Assigning..." : "Assign shift"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
