import { z } from "zod";

const nameSchema = z.string().trim().min(2, "Name must be at least 2 characters.").max(80, "Name must be at most 80 characters.");
const descriptionSchema = z.string().trim().max(255, "Description must be at most 255 characters.").optional().or(z.literal(""));
const uuid = z.string().uuid("Invalid id.");
const dateOnly = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD.");
const time = z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Time must be HH:MM.");
const phoneRegex = /^[+]?[\d\s()-]{7,20}$/;

export const idParamsSchema = z.object({
  params: z.object({ id: uuid }),
});

export const namedResourceCreateSchema = z.object({
  body: z.object({
    name: nameSchema,
    description: descriptionSchema,
  }),
});

export const namedResourceUpdateSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      name: nameSchema.optional(),
      description: descriptionSchema.nullable(),
    })
    .refine((value) => Object.keys(value).length > 0, "Provide at least one field to update."),
});

export const employeeCreateSchema = z.object({
  body: z.object({
    firstName: z.string().trim().min(2, "First name must be at least 2 characters.").max(50),
    lastName: z.string().trim().min(2, "Last name must be at least 2 characters.").max(50),
    email: z.string().trim().email("Enter a valid email address.").max(120),
    phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number.").optional().or(z.literal("")),
    hireDate: dateOnly,
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
    departmentId: z.string().uuid("Select a valid department."),
    roleId: z.string().uuid("Select a valid role."),
  }),
});

export const employeeUpdateSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      firstName: z.string().trim().min(2).max(50).optional(),
      lastName: z.string().trim().min(2).max(50).optional(),
      email: z.string().trim().email("Enter a valid email address.").max(120).optional(),
      phone: z.string().trim().regex(phoneRegex, "Enter a valid phone number.").nullable().optional(),
      hireDate: dateOnly.optional(),
      status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
      departmentId: z.string().uuid("Select a valid department.").optional(),
      roleId: z.string().uuid("Select a valid role.").optional(),
    })
    .refine((value) => Object.keys(value).length > 0, "Provide at least one field to update."),
});

export const employeeListQuerySchema = z.object({
  query: z.object({
    search: z.string().optional(),
    departmentId: uuid.optional(),
    roleId: uuid.optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  }),
});

export const shiftCreateSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(80),
    startTime: time,
    endTime: time,
    description: z.string().trim().max(255).optional().or(z.literal("")),
  }),
});

export const shiftUpdateSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      name: z.string().trim().min(2).max(80).optional(),
      startTime: time.optional(),
      endTime: time.optional(),
      description: z.string().trim().max(255).nullable().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, "Provide at least one field to update."),
});

export const assignmentCreateSchema = z.object({
  body: z.object({
    employeeId: z.string().uuid("Select a valid employee."),
    shiftId: z.string().uuid("Select a valid shift."),
    date: dateOnly,
    notes: z.string().trim().max(255).optional().or(z.literal("")),
  }),
});

export const assignmentListQuerySchema = z.object({
  query: z.object({
    employeeId: uuid.optional(),
    departmentId: uuid.optional(),
    shiftId: uuid.optional(),
    from: dateOnly.optional(),
    to: dateOnly.optional(),
  }),
});

export const attendanceCreateSchema = z
  .object({
    body: z.object({
      employeeId: z.string().uuid("Select a valid employee."),
      date: dateOnly,
      status: z.enum(["PRESENT", "ABSENT", "LATE", "LEAVE"], { required_error: "Select an attendance status." }),
      checkIn: z.string().optional().or(z.literal("")),
      checkOut: z.string().optional().or(z.literal("")),
      notes: z.string().trim().max(255).optional().or(z.literal("")),
    }),
  })
  .superRefine((value, ctx) => {
    const { status, checkIn, checkOut } = value.body;
    if ((status === "PRESENT" || status === "LATE") && !checkIn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "checkIn"],
        message: "Check-in time is required for present and late records.",
      });
    }
    if (checkIn && checkOut && new Date(checkOut) <= new Date(checkIn)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["body", "checkOut"],
        message: "Check-out must be after check-in.",
      });
    }
  });

export const attendanceUpdateSchema = z.object({
  params: z.object({ id: uuid }),
  body: z
    .object({
      status: z.enum(["PRESENT", "ABSENT", "LATE", "LEAVE"]).optional(),
      checkIn: z.string().nullable().optional(),
      checkOut: z.string().nullable().optional(),
      notes: z.string().trim().max(255).nullable().optional(),
    })
    .refine((value) => Object.keys(value).length > 0, "Provide at least one field to update."),
});

export const attendanceListQuerySchema = z.object({
  query: z.object({
    employeeId: uuid.optional(),
    departmentId: uuid.optional(),
    status: z.enum(["PRESENT", "ABSENT", "LATE", "LEAVE"]).optional(),
    from: dateOnly.optional(),
    to: dateOnly.optional(),
  }),
});

export const reportRangeQuerySchema = z.object({
  query: z.object({
    from: dateOnly.optional(),
    to: dateOnly.optional(),
  }),
});

export const coverageQuerySchema = z.object({
  query: z.object({
    date: dateOnly.optional(),
  }),
});
