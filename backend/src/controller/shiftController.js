import { employeeModel } from "../model/employeeModel.js";
import { shiftModel } from "../model/shiftModel.js";
import { AppError } from "../utils/AppError.js";
import { assertValidTime, parseDateOnly } from "../utils/date.js";
import { serializeAssignment } from "../utils/serialize.js";

export async function listShifts(_req, res) {
  const data = await shiftModel.findAll();
  res.json({ success: true, data });
}

export async function getShift(req, res) {
  const shift = await shiftModel.findById(req.params.id);
  if (!shift) throw AppError.notFound("Shift");
  res.json({ success: true, data: shift });
}

export async function createShift(req, res) {
  assertValidTime(req.body.startTime, "startTime");
  assertValidTime(req.body.endTime, "endTime");

  const existing = await shiftModel.findByName(req.body.name.trim());
  if (existing) throw AppError.conflict("A shift with this name already exists.");

  const data = await shiftModel.create({
    name: req.body.name.trim(),
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    description: req.body.description?.trim() || null,
  });
  res.status(201).json({ success: true, message: "Shift created successfully.", data });
}

export async function updateShift(req, res) {
  const current = await shiftModel.findById(req.params.id);
  if (!current) throw AppError.notFound("Shift");

  if (req.body.startTime) assertValidTime(req.body.startTime, "startTime");
  if (req.body.endTime) assertValidTime(req.body.endTime, "endTime");
  if (req.body.name) {
    const existing = await shiftModel.findByName(req.body.name.trim());
    if (existing && existing.id !== req.params.id) {
      throw AppError.conflict("A shift with this name already exists.");
    }
  }

  const data = await shiftModel.update(req.params.id, {
    name: req.body.name?.trim(),
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    description: req.body.description === undefined ? undefined : req.body.description?.trim() || null,
  });
  res.json({ success: true, message: "Shift updated successfully.", data });
}

export async function deleteShift(req, res) {
  const current = await shiftModel.findById(req.params.id);
  if (!current) throw AppError.notFound("Shift");

  const assigned = await shiftModel.countAssignments(req.params.id);
  if (assigned > 0) {
    throw AppError.conflict("Cannot delete a shift that still has employee assignments.");
  }

  await shiftModel.delete(req.params.id);
  res.json({ success: true, message: "Shift deleted successfully." });
}

export async function listAssignments(req, res) {
  const records = await shiftModel.findAssignments({
    employeeId: req.query.employeeId,
    departmentId: req.query.departmentId,
    shiftId: req.query.shiftId,
    from: req.query.from ? parseDateOnly(req.query.from, "from") : undefined,
    to: req.query.to ? parseDateOnly(req.query.to, "to") : undefined,
  });
  res.json({ success: true, data: records.map(serializeAssignment) });
}

export async function assignShift(req, res) {
  const employee = await employeeModel.findById(req.body.employeeId);
  if (!employee) throw AppError.badRequest("Selected employee does not exist.");
  if (employee.status === "INACTIVE") {
    throw AppError.badRequest("Cannot assign a shift to an inactive employee.");
  }

  const shift = await shiftModel.findById(req.body.shiftId);
  if (!shift) throw AppError.badRequest("Selected shift does not exist.");

  const date = parseDateOnly(req.body.date);
  const existing = await shiftModel.findAssignmentByEmployeeAndDate(req.body.employeeId, date);
  if (existing) {
    throw AppError.conflict("This employee already has a shift assigned on that date.");
  }

  const created = await shiftModel.createAssignment({
    employeeId: req.body.employeeId,
    shiftId: req.body.shiftId,
    date,
    notes: req.body.notes?.trim() || null,
  });
  res.status(201).json({ success: true, message: "Shift assigned successfully.", data: serializeAssignment(created) });
}

export async function unassignShift(req, res) {
  const assignment = await shiftModel.findAssignmentById(req.params.id);
  if (!assignment) throw AppError.notFound("Shift assignment");
  await shiftModel.deleteAssignment(req.params.id);
  res.json({ success: true, message: "Shift assignment removed successfully." });
}
