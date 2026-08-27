import { reportModel } from "../model/reportModel.js";
import { AppError } from "../utils/AppError.js";
import { parseDateOnly, todayUtc } from "../utils/date.js";
import { minutesToClock } from "../utils/serialize.js";

function dateRange(from, to) {
  const end = to ? parseDateOnly(to, "to") : todayUtc();
  const start = from ? parseDateOnly(from, "from") : new Date(end.getTime() - 13 * 24 * 60 * 60 * 1000);
  if (start > end) throw AppError.badRequest("The start date must be on or before the end date.");
  return { from: start, to: end };
}

export async function getDashboard(_req, res) {
  const data = await reportModel.getDashboardStats();
  res.json({ success: true, data });
}

export async function getAttendanceByDepartment(req, res) {
  const range = dateRange(req.query.from, req.query.to);
  const data = await reportModel.getDepartmentAttendance(range.from, range.to);
  res.json({ success: true, data });
}

export async function getShiftCoverage(req, res) {
  const date = req.query.date ? parseDateOnly(req.query.date) : todayUtc();
  const data = await reportModel.getShiftCoverage(date);
  res.json({ success: true, data });
}

export async function getPunctuality(req, res) {
  const range = dateRange(req.query.from, req.query.to);
  const rows = await reportModel.getPunctuality(range.from, range.to);
  res.json({
    success: true,
    data: rows.map((row) => ({
      ...row,
      averageArrivalTime: minutesToClock(row.averageArrivalMinutes),
    })),
  });
}
