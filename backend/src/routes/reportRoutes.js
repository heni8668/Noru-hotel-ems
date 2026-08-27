import { Router } from "express";
import {
  getAttendanceByDepartment,
  getDashboard,
  getPunctuality,
  getShiftCoverage,
} from "../controller/reportController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { coverageQuerySchema, reportRangeQuerySchema } from "../utils/validators.js";

const router = Router();

router.get("/dashboard", asyncHandler(getDashboard));
router.get("/attendance-by-department", validate(reportRangeQuerySchema), asyncHandler(getAttendanceByDepartment));
router.get("/shift-coverage", validate(coverageQuerySchema), asyncHandler(getShiftCoverage));
router.get("/punctuality", validate(reportRangeQuerySchema), asyncHandler(getPunctuality));

export default router;
