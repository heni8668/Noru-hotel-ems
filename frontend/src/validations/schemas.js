import { z } from "zod";

export const namedEntitySchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name is too long."),
  description: z.string().trim().max(255, "Description is too long.").optional(),
});

export const employeeSchema = z.object({
  firstName: z.string().trim().min(2, "First name must be at least 2 characters.").max(50),
  lastName: z.string().trim().min(2, "Last name must be at least 2 characters.").max(50),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z
    .string()
    .trim()
    .optional()
    .refine((value) => !value || /^[+]?[\d\s()-]{7,20}$/.test(value), "Enter a valid phone number."),
  hireDate: z.string().min(1, "Hire date is required."),
  status: z.enum(["ACTIVE", "INACTIVE"]),
  departmentId: z.string().uuid("Select a department."),
  roleId: z.string().uuid("Select a role."),
});

export const shiftSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(80),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be HH:MM."),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be HH:MM."),
  description: z.string().trim().max(255).optional(),
});

export const assignmentSchema = z.object({
  employeeId: z.string().uuid("Select an employee."),
  shiftId: z.string().uuid("Select a shift."),
  date: z.string().min(1, "Date is required."),
  notes: z.string().trim().max(255).optional(),
});

export const attendanceSchema = z
  .object({
    employeeId: z.string().uuid("Select an employee."),
    date: z.string().min(1, "Date is required."),
    status: z.enum(["PRESENT", "ABSENT", "LATE", "LEAVE"]),
    checkIn: z.string().optional(),
    checkOut: z.string().optional(),
    notes: z.string().trim().max(255).optional(),
  })
  .superRefine((value, ctx) => {
    if ((value.status === "PRESENT" || value.status === "LATE") && !value.checkIn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkIn"],
        message: "Check-in time is required for present and late records.",
      });
    }
    if (value.checkIn && value.checkOut && value.checkOut === value.checkIn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkOut"],
        message: "Check-out must be different from check-in.",
      });
    }
  });
