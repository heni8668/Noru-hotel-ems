import { attendanceModel } from "../model/attendanceModel.js";
import { employeeModel } from "../model/employeeModel.js";
import { AppError } from "../utils/AppError.js";
import { parseDateOnly, parseOptionalDateTime } from "../utils/date.js";
import { serializeAttendance } from "../utils/serialize.js";

function assertTimes(status, checkIn, checkOut) {
  if ((status === "ABSENT" || status === "LEAVE") && (checkIn || checkOut)) {
    throw AppError.badRequest("Absent and leave records should not include check-in or check-out times.");
  }
  if ((status === "PRESENT" || status === "LATE") && !checkIn) {
    throw AppError.badRequest("Present and late records require a check-in time.");
  }
  if (checkIn && checkOut && checkOut <= checkIn) {
    throw AppError.badRequest("Check-out time must be after check-in time.");
  }
}

export async function listAttendance(req, res) {
  const records = await attendanceModel.findAll({
    employeeId: req.query.employeeId,
    departmentId: req.query.departmentId,
    status: req.query.status,
    from: req.query.from ? parseDateOnly(req.query.from, "from") : undefined,
    to: req.query.to ? parseDateOnly(req.query.to, "to") : undefined,
  });
  res.json({ success: true, data: records.map(serializeAttendance) });
}

export async function getAttendance(req, res) {
  const record = await attendanceModel.findById(req.params.id);
  if (!record) throw AppError.notFound("Attendance record");
  res.json({ success: true, data: serializeAttendance(record) });
}

export async function createAttendance(req, res) {
  const employee = await employeeModel.findById(req.body.employeeId);
  if (!employee) throw AppError.badRequest("Selected employee does not exist.");

  const date = parseDateOnly(req.body.date);
  const existing = await attendanceModel.findByEmployeeAndDate(req.body.employeeId, date);
  if (existing) {
    throw AppError.conflict("Attendance for this employee on that date has already been recorded.");
  }

  const checkIn = parseOptionalDateTime(req.body.checkIn) ?? null;
  const checkOut = parseOptionalDateTime(req.body.checkOut) ?? null;
  assertTimes(req.body.status, checkIn, checkOut);

  const created = await attendanceModel.create({
    employeeId: req.body.employeeId,
    date,
    checkIn,
    checkOut,
    status: req.body.status,
    notes: req.body.notes?.trim() || null,
  });
  res.status(201).json({ success: true, message: "Attendance recorded successfully.", data: serializeAttendance(created) });
}

export async function updateAttendance(req, res) {
  const current = await attendanceModel.findById(req.params.id);
  if (!current) throw AppError.notFound("Attendance record");

  const status = req.body.status ?? current.status;
  const checkIn = req.body.checkIn === undefined ? current.checkIn : parseOptionalDateTime(req.body.checkIn) ?? null;
  const checkOut = req.body.checkOut === undefined ? current.checkOut : parseOptionalDateTime(req.body.checkOut) ?? null;
  assertTimes(status, checkIn, checkOut);

  const updated = await attendanceModel.update(req.params.id, {
    status,
    checkIn,
    checkOut,
    notes: req.body.notes === undefined ? undefined : req.body.notes?.trim() || null,
  });
  res.json({ success: true, message: "Attendance updated successfully.", data: serializeAttendance(updated) });
}

export async function deleteAttendance(req, res) {
  const current = await attendanceModel.findById(req.params.id);
  if (!current) throw AppError.notFound("Attendance record");
  await attendanceModel.delete(req.params.id);
  res.json({ success: true, message: "Attendance record deleted successfully." });
}
