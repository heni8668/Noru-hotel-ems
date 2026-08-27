export class AppError extends Error {
  constructor(statusCode, message, code = "APP_ERROR", details) {
    super(message);
    this.name = "AppError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }

  static badRequest(message, details) {
    return new AppError(400, message, "BAD_REQUEST", details);
  }

  static notFound(resource) {
    return new AppError(404, `${resource} was not found.`, "NOT_FOUND");
  }

  static conflict(message, details) {
    return new AppError(409, message, "CONFLICT", details);
  }
}
