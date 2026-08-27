import { Router } from "express";
import {
  createDepartment,
  deleteDepartment,
  getDepartment,
  listDepartments,
  updateDepartment,
} from "../controller/departmentController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { idParamsSchema, namedResourceCreateSchema, namedResourceUpdateSchema } from "../utils/validators.js";

const router = Router();

router.get("/", asyncHandler(listDepartments));
router.get("/:id", validate(idParamsSchema), asyncHandler(getDepartment));
router.post("/", validate(namedResourceCreateSchema), asyncHandler(createDepartment));
router.put("/:id", validate(namedResourceUpdateSchema), asyncHandler(updateDepartment));
router.delete("/:id", validate(idParamsSchema), asyncHandler(deleteDepartment));

export default router;
