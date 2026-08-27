export function cn(...values) {
  return values.filter(Boolean).join(" ");
}

export function todayIso() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function daysAgoIso(days) {
  const now = new Date();
  now.setDate(now.getDate() - days);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

export function formatDate(value) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function fullName(employee) {
  return `${employee.firstName} ${employee.lastName}`;
}

export function toIsoDateTime(date, time, afterTime) {
  if (!date || !time) return "";
  const value = new Date(`${date}T${time}`);
  if (Number.isNaN(value.getTime())) return "";
  if (afterTime) {
    const after = new Date(`${date}T${afterTime}`);
    if (!Number.isNaN(after.getTime()) && value <= after) {
      value.setDate(value.getDate() + 1);
    }
  }
  return value.toISOString();
}

export function isoToTimeInput(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function toThunkError(error) {
  return {
    message: error.response?.data?.error?.message || error.message || "Something went wrong. Please try again.",
    details: error.response?.data?.error?.details || [],
  };
}

export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (!error || typeof error !== "object") return fallback;
  return error.message || error.response?.data?.error?.message || fallback;
}

export function getFieldErrors(error) {
  const details = error?.details || error?.response?.data?.error?.details;
  if (!Array.isArray(details)) return {};
  return details.reduce((acc, item) => {
    if (item.field && item.message) acc[item.field] = item.message;
    return acc;
  }, {});
}
