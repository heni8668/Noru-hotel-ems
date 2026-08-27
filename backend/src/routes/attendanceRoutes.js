import { Router } from "express";
import {
  createAttendance,
  deleteAttendance,
  getAttendance,
  listAttendance,
  updateAttendance,
} from "../controller/attendanceController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import {
  attendanceCreateSchema,
  attendanceListQuerySchema,
  attendanceUpdateSchema,
  idParamsSchema,
} from "../utils/validators.js";

const router = Router();

router.get("/", validate(attendanceListQuerySchema), asyncHandler(listAttendance));
router.get("/:id", validate(idParamsSchema), asyncHandler(getAttendance));
router.post("/", validate(attendanceCreateSchema), asyncHandler(createAttendance));
router.put("/:id", validate(attendanceUpdateSchema), asyncHandler(updateAttendance));
router.delete("/:id", validate(idParamsSchema), asyncHandler(deleteAttendance));

export default router;
