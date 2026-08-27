import { Prisma } from "@prisma/client";
import { AppError } from "../utils/AppError.js";

export function mapPrismaError(error) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const fields = Array.isArray(error.meta?.target) ? error.meta.target.join(", ") : "record";
      throw AppError.conflict(`A record with the same ${fields} already exists.`);
    }
    if (error.code === "P2003") {
      throw AppError.conflict("This record is still referenced by related data and cannot be changed that way.");
    }
    if (error.code === "P2025") {
      throw AppError.notFound("Record");
    }
  }
  throw error;
}
