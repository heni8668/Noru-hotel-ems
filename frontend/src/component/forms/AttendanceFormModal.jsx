import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { Field, SelectInput, TextArea, TextInput } from "../ui/Form";
import { Modal } from "../ui/Modal";
import { attendanceSchema } from "../../validations/schemas";
import { fullName, getApiErrorMessage, getFieldErrors, isoToTimeInput, toIsoDateTime, todayIso } from "../../utils";

export function AttendanceFormModal({ open, record, employees, submitting, onClose, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      employeeId: "",
      date: todayIso(),
      status: "PRESENT",
      checkIn: "08:00",
      checkOut: "16:00",
      notes: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      record
        ? {
            employeeId: record.employeeId,
            date: record.date,
            status: record.status,
            checkIn: isoToTimeInput(record.checkIn),
            checkOut: isoToTimeInput(record.checkOut),
            notes: record.notes ?? "",
          }
        : {
            employeeId: "",
            date: todayIso(),
            status: "PRESENT",
            checkIn: "08:00",
            checkOut: "16:00",
            notes: "",
          },
    );
  }, [open, record]);

  const status = form.watch("status");
  const needsTimes = status === "PRESENT" || status === "LATE";

  return (
    <Modal open={open} title={record ? "Edit attendance" : "Record attendance"} onClose={onClose}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            const payload = {
              employeeId: values.employeeId,
              date: values.date,
              status: values.status,
              notes: values.notes,
              checkIn: needsTimes ? toIsoDateTime(values.date, values.checkIn || "") : null,
              checkOut: needsTimes && values.checkOut ? toIsoDateTime(values.date, values.checkOut, values.checkIn) : null,
            };
            const result = await onSubmit(payload);
            toast.success(result.message || "Attendance saved.");
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
          <SelectInput {...form.register("employeeId")} disabled={Boolean(record)}>
            <option value="">Select employee</option>
            {employees.map((item) => (
              <option key={item.id} value={item.id}>
                {fullName(item)} — {item.department.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Date" error={form.formState.errors.date?.message}>
            <TextInput type="date" {...form.register("date")} disabled={Boolean(record)} />
          </Field>
          <Field label="Status" error={form.formState.errors.status?.message}>
            <SelectInput {...form.register("status")}>
              <option value="PRESENT">Present</option>
              <option value="LATE">Late</option>
              <option value="ABSENT">Absent</option>
              <option value="LEAVE">Leave</option>
            </SelectInput>
          </Field>
        </div>
        {needsTimes ? (
          <div className="grid grid-cols-2 gap-4">
            <Field label="Check in" error={form.formState.errors.checkIn?.message}>
              <TextInput type="time" {...form.register("checkIn")} />
            </Field>
            <Field label="Check out" error={form.formState.errors.checkOut?.message}>
              <TextInput type="time" {...form.register("checkOut")} />
            </Field>
          </div>
        ) : null}
        <Field label="Notes" error={form.formState.errors.notes?.message}>
          <TextArea {...form.register("notes")} />
        </Field>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save attendance"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
