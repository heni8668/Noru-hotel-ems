import { departmentModel } from "../model/departmentModel.js";
import { employeeModel } from "../model/employeeModel.js";
import { roleModel } from "../model/roleModel.js";
import { AppError } from "../utils/AppError.js";
import { parseDateOnly, todayUtc } from "../utils/date.js";
import { serializeEmployee } from "../utils/serialize.js";

async function assertRelations(departmentId, roleId) {
  const [department, role] = await Promise.all([departmentModel.findById(departmentId), roleModel.findById(roleId)]);
  if (!department) throw AppError.badRequest("Selected department does not exist.");
  if (!role) throw AppError.badRequest("Selected role does not exist.");
}

export async function listEmployees(req, res) {
  const records = await employeeModel.findAll({
    search: req.query.search,
    departmentId: req.query.departmentId,
    roleId: req.query.roleId,
    status: req.query.status,
  });
  res.json({ success: true, data: records.map(serializeEmployee) });
}

export async function getEmployee(req, res) {
  const employee = await employeeModel.findById(req.params.id);
  if (!employee) throw AppError.notFound("Employee");
  res.json({ success: true, data: serializeEmployee(employee) });
}

export async function createEmployee(req, res) {
  await assertRelations(req.body.departmentId, req.body.roleId);

  const email = req.body.email.trim().toLowerCase();
  const existing = await employeeModel.findByEmail(email);
  if (existing) throw AppError.conflict("An employee with this email already exists.");

  const hireDate = parseDateOnly(req.body.hireDate, "hireDate");
  if (hireDate > todayUtc()) {
    throw AppError.badRequest("Hire date cannot be in the future.");
  }

  const created = await employeeModel.create({
    firstName: req.body.firstName.trim(),
    lastName: req.body.lastName.trim(),
    email,
    phone: req.body.phone?.trim() || null,
    hireDate,
    status: req.body.status ?? "ACTIVE",
    departmentId: req.body.departmentId,
    roleId: req.body.roleId,
  });
  res.status(201).json({ success: true, message: "Employee created successfully.", data: serializeEmployee(created) });
}

export async function updateEmployee(req, res) {
  const current = await employeeModel.findById(req.params.id);
  if (!current) throw AppError.notFound("Employee");

  if (req.body.departmentId || req.body.roleId) {
    await assertRelations(req.body.departmentId ?? current.departmentId, req.body.roleId ?? current.roleId);
  }

  if (req.body.email) {
    const email = req.body.email.trim().toLowerCase();
    const existing = await employeeModel.findByEmail(email);
    if (existing && existing.id !== req.params.id) {
      throw AppError.conflict("An employee with this email already exists.");
    }
  }

  let hireDate;
  if (req.body.hireDate) {
    hireDate = parseDateOnly(req.body.hireDate, "hireDate");
    if (hireDate > todayUtc()) {
      throw AppError.badRequest("Hire date cannot be in the future.");
    }
  }

  const updated = await employeeModel.update(req.params.id, {
    firstName: req.body.firstName?.trim(),
    lastName: req.body.lastName?.trim(),
    email: req.body.email?.trim().toLowerCase(),
    phone: req.body.phone === undefined ? undefined : req.body.phone?.trim() || null,
    hireDate,
    status: req.body.status,
    departmentId: req.body.departmentId,
    roleId: req.body.roleId,
  });
  res.json({ success: true, message: "Employee updated successfully.", data: serializeEmployee(updated) });
}

export async function deleteEmployee(req, res) {
  const current = await employeeModel.findById(req.params.id);
  if (!current) throw AppError.notFound("Employee");
  await employeeModel.delete(req.params.id);
  res.json({ success: true, message: "Employee deleted successfully." });
}
