import { Router } from "express";
import {
  createEmployee,
  deleteEmployee,
  getEmployee,
  listEmployees,
  updateEmployee,
} from "../controller/employeeController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import {
  employeeCreateSchema,
  employeeListQuerySchema,
  employeeUpdateSchema,
  idParamsSchema,
} from "../utils/validators.js";

const router = Router();

router.get("/", validate(employeeListQuerySchema), asyncHandler(listEmployees));
router.get("/:id", validate(idParamsSchema), asyncHandler(getEmployee));
router.post("/", validate(employeeCreateSchema), asyncHandler(createEmployee));
router.put("/:id", validate(employeeUpdateSchema), asyncHandler(updateEmployee));
router.delete("/:id", validate(idParamsSchema), asyncHandler(deleteEmployee));

export default router;
