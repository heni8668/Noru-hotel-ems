import { AppError } from "../utils/AppError.js";

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });

  if (!result.success) {
    throw AppError.badRequest("Please correct the highlighted fields.", formatZodError(result.error));
  }

  if (result.data.body !== undefined) {
    req.body = result.data.body;
  }

  next();
};

export function formatZodError(error) {
  return error.issues.map((issue) => ({
    field: issue.path.filter((part) => part !== "body" && part !== "query" && part !== "params").join(".") || "form",
    message: issue.message,
  }));
}
