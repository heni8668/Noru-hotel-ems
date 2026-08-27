import { ZodError } from "zod";
import { AppError } from "../utils/AppError.js";
import { formatZodError } from "./validate.js";

export function notFoundHandler(_req, _res, next) {
  next(AppError.notFound("Endpoint"));
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof SyntaxError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Request body must be valid JSON.",
        details: null,
      },
    });
  }

  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "BAD_REQUEST",
        message: "Please correct the highlighted fields.",
        details: formatZodError(err),
      },
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? null,
      },
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred. Please try again.",
      details: null,
    },
  });
}
