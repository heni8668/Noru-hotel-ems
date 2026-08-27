import { Router } from "express";
import {
  assignShift,
  createShift,
  deleteShift,
  getShift,
  listAssignments,
  listShifts,
  unassignShift,
  updateShift,
} from "../controller/shiftController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import {
  assignmentCreateSchema,
  assignmentListQuerySchema,
  idParamsSchema,
  shiftCreateSchema,
  shiftUpdateSchema,
} from "../utils/validators.js";

const router = Router();

router.get("/", asyncHandler(listShifts));
router.post("/", validate(shiftCreateSchema), asyncHandler(createShift));
router.get("/assignments", validate(assignmentListQuerySchema), asyncHandler(listAssignments));
router.post("/assignments", validate(assignmentCreateSchema), asyncHandler(assignShift));
router.delete("/assignments/:id", validate(idParamsSchema), asyncHandler(unassignShift));
router.get("/:id", validate(idParamsSchema), asyncHandler(getShift));
router.put("/:id", validate(shiftUpdateSchema), asyncHandler(updateShift));
router.delete("/:id", validate(idParamsSchema), asyncHandler(deleteShift));

export default router;
