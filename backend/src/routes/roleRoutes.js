import { Router } from "express";
import { createRole, deleteRole, getRole, listRoles, updateRole } from "../controller/roleController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { validate } from "../middleware/validate.js";
import { idParamsSchema, namedResourceCreateSchema, namedResourceUpdateSchema } from "../utils/validators.js";

const router = Router();

router.get("/", asyncHandler(listRoles));
router.get("/:id", validate(idParamsSchema), asyncHandler(getRole));
router.post("/", validate(namedResourceCreateSchema), asyncHandler(createRole));
router.put("/:id", validate(namedResourceUpdateSchema), asyncHandler(updateRole));
router.delete("/:id", validate(idParamsSchema), asyncHandler(deleteRole));

export default router;
