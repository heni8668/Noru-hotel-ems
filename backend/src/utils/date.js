import { AppError } from "./AppError.js";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const TIME_ONLY = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function parseDateOnly(value, field = "date") {
  if (!DATE_ONLY.test(value)) {
    throw AppError.badRequest(`${field} must be a valid date in YYYY-MM-DD format.`);
  }
  const date = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    throw AppError.badRequest(`${field} must be a valid date in YYYY-MM-DD format.`);
  }
  return date;
}

export function todayUtc() {
  const now = new Date();
  return new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
}

export function toDateOnly(date) {
  return date.toISOString().slice(0, 10);
}

export function assertValidTime(value, field) {
  if (!TIME_ONLY.test(value)) {
    throw AppError.badRequest(`${field} must be a valid 24-hour time in HH:MM format.`);
  }
}

export function parseOptionalDateTime(value) {
  if (value === undefined) return undefined;
  if (value === null || value === "") return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw AppError.badRequest("Time values must be valid ISO date-times.");
  }
  return date;
}
