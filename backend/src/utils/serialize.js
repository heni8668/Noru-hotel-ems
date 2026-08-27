import { toDateOnly } from "./date.js";

export function serializeEmployee(employee) {
  return {
    ...employee,
    hireDate: toDateOnly(employee.hireDate),
  };
}

export function serializeAssignment(assignment) {
  return {
    ...assignment,
    date: toDateOnly(assignment.date),
    employee: serializeEmployee(assignment.employee),
  };
}

export function serializeAttendance(record) {
  return {
    ...record,
    date: toDateOnly(record.date),
    employee: record.employee ? serializeEmployee(record.employee) : undefined,
  };
}

export function minutesToClock(minutes) {
  if (minutes === null || Number.isNaN(minutes)) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
