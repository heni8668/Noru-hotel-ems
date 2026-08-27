import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { Field, SelectInput, TextInput } from "../ui/Form";
import { Modal } from "../ui/Modal";
import { employeeSchema } from "../../validations/schemas";
import { getApiErrorMessage, getFieldErrors, todayIso } from "../../utils";

export function EmployeeFormModal({ open, employee, departments, roles, submitting, onClose, onSubmit }) {
  const form = useForm({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      hireDate: todayIso(),
      status: "ACTIVE",
      departmentId: "",
      roleId: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset(
      employee
        ? {
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            phone: employee.phone ?? "",
            hireDate: employee.hireDate,
            status: employee.status,
            departmentId: employee.departmentId,
            roleId: employee.roleId,
          }
        : {
            firstName: "",
            lastName: "",
            email: "",
            phone: "",
            hireDate: todayIso(),
            status: "ACTIVE",
            departmentId: "",
            roleId: "",
          },
    );
  }, [open, employee]);

  return (
    <Modal open={open} title={employee ? "Edit employee" : "Add employee"} onClose={onClose}>
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={form.handleSubmit(async (values) => {
          try {
            const result = await onSubmit(values);
            toast.success(result.message || "Employee saved.");
            onClose();
          } catch (error) {
            Object.entries(getFieldErrors(error)).forEach(([name, message]) => {
              form.setError(name, { message });
            });
            toast.error(getApiErrorMessage(error));
          }
        })}
      >
        <Field label="First name" error={form.formState.errors.firstName?.message}>
          <TextInput {...form.register("firstName")} />
        </Field>
        <Field label="Last name" error={form.formState.errors.lastName?.message}>
          <TextInput {...form.register("lastName")} />
        </Field>
        <Field label="Email" error={form.formState.errors.email?.message}>
          <TextInput type="email" {...form.register("email")} />
        </Field>
        <Field label="Phone" error={form.formState.errors.phone?.message}>
          <TextInput {...form.register("phone")} placeholder="+251 911 000 000" />
        </Field>
        <Field label="Hire date" error={form.formState.errors.hireDate?.message}>
          <TextInput type="date" max={todayIso()} {...form.register("hireDate")} />
        </Field>
        <Field label="Status" error={form.formState.errors.status?.message}>
          <SelectInput {...form.register("status")}>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </SelectInput>
        </Field>
        <Field label="Department" error={form.formState.errors.departmentId?.message}>
          <SelectInput {...form.register("departmentId")}>
            <option value="">Select department</option>
            {departments.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <Field label="Role" error={form.formState.errors.roleId?.message}>
          <SelectInput {...form.register("roleId")}>
            <option value="">Select role</option>
            {roles.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </SelectInput>
        </Field>
        <div className="flex justify-end gap-3 sm:col-span-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Saving..." : "Save employee"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
