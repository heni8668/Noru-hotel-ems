import { roleModel } from "../model/roleModel.js";
import { AppError } from "../utils/AppError.js";

export async function listRoles(_req, res) {
  const data = await roleModel.findAll();
  res.json({ success: true, data });
}

export async function getRole(req, res) {
  const role = await roleModel.findById(req.params.id);
  if (!role) throw AppError.notFound("Role");
  res.json({ success: true, data: role });
}

export async function createRole(req, res) {
  const existing = await roleModel.findByName(req.body.name.trim());
  if (existing) throw AppError.conflict("A role with this name already exists.");

  const data = await roleModel.create({
    name: req.body.name.trim(),
    description: req.body.description?.trim() || null,
  });
  res.status(201).json({ success: true, message: "Role created successfully.", data });
}

export async function updateRole(req, res) {
  const current = await roleModel.findById(req.params.id);
  if (!current) throw AppError.notFound("Role");

  if (req.body.name) {
    const existing = await roleModel.findByName(req.body.name.trim());
    if (existing && existing.id !== req.params.id) {
      throw AppError.conflict("A role with this name already exists.");
    }
  }

  const data = await roleModel.update(req.params.id, {
    name: req.body.name?.trim(),
    description: req.body.description === undefined ? undefined : req.body.description?.trim() || null,
  });
  res.json({ success: true, message: "Role updated successfully.", data });
}

export async function deleteRole(req, res) {
  const current = await roleModel.findById(req.params.id);
  if (!current) throw AppError.notFound("Role");

  const assigned = await roleModel.countEmployees(req.params.id);
  if (assigned > 0) {
    throw AppError.conflict("Cannot delete a role that is still assigned to employees.");
  }

  await roleModel.delete(req.params.id);
  res.json({ success: true, message: "Role deleted successfully." });
}
