import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
import employeeRoutes from "./routes/employeeRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import roleRoutes from "./routes/roleRoutes.js";
import shiftRoutes from "./routes/shiftRoutes.js";

const app = express();

app.use(helmet());
app.use(cors({ origin: (process.env.CORS_ORIGIN || "http://localhost:5173").split(",").map((value) => value.trim()) }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/health", (_req, res) => {
  res.json({ success: true, data: { status: "ok", service: "noru-hotel-ems-api" } });
});

app.use("/api/departments", departmentRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/reports", reportRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
