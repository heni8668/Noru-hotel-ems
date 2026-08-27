import { departmentModel } from "../model/departmentModel.js";
import { AppError } from "../utils/AppError.js";

export async function listDepartments(_req, res) {
  const data = await departmentModel.findAll();
  res.json({ success: true, data });
}

export async function getDepartment(req, res) {
  const department = await departmentModel.findById(req.params.id);
  if (!department) throw AppError.notFound("Department");
  res.json({ success: true, data: department });
}

export async function createDepartment(req, res) {
  const existing = await departmentModel.findByName(req.body.name.trim());
  if (existing) throw AppError.conflict("A department with this name already exists.");

  const data = await departmentModel.create({
    name: req.body.name.trim(),
    description: req.body.description?.trim() || null,
  });
  res.status(201).json({ success: true, message: "Department created successfully.", data });
}

export async function updateDepartment(req, res) {
  const current = await departmentModel.findById(req.params.id);
  if (!current) throw AppError.notFound("Department");

  if (req.body.name) {
    const existing = await departmentModel.findByName(req.body.name.trim());
    if (existing && existing.id !== req.params.id) {
      throw AppError.conflict("A department with this name already exists.");
    }
  }

  const data = await departmentModel.update(req.params.id, {
    name: req.body.name?.trim(),
    description: req.body.description === undefined ? undefined : req.body.description?.trim() || null,
  });
  res.json({ success: true, message: "Department updated successfully.", data });
}

export async function deleteDepartment(req, res) {
  const current = await departmentModel.findById(req.params.id);
  if (!current) throw AppError.notFound("Department");

  const assigned = await departmentModel.countEmployees(req.params.id);
  if (assigned > 0) {
    throw AppError.conflict("Cannot delete a department that still has employees assigned.");
  }

  await departmentModel.delete(req.params.id);
  res.json({ success: true, message: "Department deleted successfully." });
}
