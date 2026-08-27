import { prisma } from "../db/prisma.js";
import { todayUtc } from "../utils/date.js";

export const reportModel = {
  getDepartmentAttendance(from, to) {
    return prisma.$queryRaw`
      WITH date_span AS (
        SELECT GREATEST((${to}::date - ${from}::date) + 1, 1) AS days
      )
      SELECT
        d.id AS "departmentId",
        d.name AS "departmentName",
        COUNT(DISTINCT e.id)::int AS "employeeCount",
        (COUNT(DISTINCT e.id) * (SELECT days FROM date_span))::int AS "expectedAttendance",
        COUNT(a.id) FILTER (WHERE a.status = 'PRESENT')::int AS "presentCount",
        COUNT(a.id) FILTER (WHERE a.status = 'LATE')::int AS "lateCount",
        COUNT(a.id) FILTER (WHERE a.status = 'ABSENT')::int AS "absentCount",
        COUNT(a.id) FILTER (WHERE a.status = 'LEAVE')::int AS "leaveCount",
        ROUND(
          CASE
            WHEN COUNT(DISTINCT e.id) * (SELECT days FROM date_span) = 0 THEN 0
            ELSE (
              COUNT(a.id) FILTER (WHERE a.status IN ('PRESENT', 'LATE'))::numeric
              / (COUNT(DISTINCT e.id) * (SELECT days FROM date_span))
            ) * 100
          END
        , 1)::float AS "attendanceRate",
        ROUND(
          CASE
            WHEN COUNT(a.id) FILTER (WHERE a.status IN ('PRESENT', 'LATE')) = 0 THEN 0
            ELSE (
              COUNT(a.id) FILTER (WHERE a.status = 'PRESENT')::numeric
              / COUNT(a.id) FILTER (WHERE a.status IN ('PRESENT', 'LATE'))
            ) * 100
          END
        , 1)::float AS "punctualityRate",
        ROUND(
          COALESCE(
            AVG(
              EXTRACT(EPOCH FROM (a."checkOut" - a."checkIn")) / 3600.0
            ) FILTER (WHERE a."checkIn" IS NOT NULL AND a."checkOut" IS NOT NULL),
            0
          )
        , 2)::float AS "averageHoursWorked"
      FROM "Department" d
      LEFT JOIN "Employee" e ON e."departmentId" = d.id AND e.status = 'ACTIVE'
      LEFT JOIN "Attendance" a
        ON a."employeeId" = e.id
       AND a.date BETWEEN ${from}::date AND ${to}::date
      GROUP BY d.id, d.name
      ORDER BY d.name;
    `;
  },

  getShiftCoverage(date) {
    return prisma.$queryRaw`
      SELECT
        d.id AS "departmentId",
        d.name AS "departmentName",
        s.id AS "shiftId",
        s.name AS "shiftName",
        s."startTime" AS "startTime",
        s."endTime" AS "endTime",
        COUNT(es.id)::int AS "assignedCount",
        COUNT(DISTINCT e.id)::int AS "activeEmployeeCount",
        ROUND(
          CASE
            WHEN COUNT(DISTINCT e.id) = 0 THEN 0
            ELSE (COUNT(es.id)::numeric / COUNT(DISTINCT e.id)) * 100
          END
        , 1)::float AS "coveragePercent"
      FROM "Department" d
      CROSS JOIN "Shift" s
      LEFT JOIN "Employee" e ON e."departmentId" = d.id AND e.status = 'ACTIVE'
      LEFT JOIN "EmployeeShift" es
        ON es."employeeId" = e.id
       AND es."shiftId" = s.id
       AND es.date = ${date}::date
      GROUP BY d.id, d.name, s.id, s.name, s."startTime", s."endTime"
      ORDER BY d.name, s."startTime";
    `;
  },

  getPunctuality(from, to) {
    return prisma.$queryRaw`
      SELECT
        e.id AS "employeeId",
        CONCAT(e."firstName", ' ', e."lastName") AS "fullName",
        d.name AS "departmentName",
        r.name AS "roleName",
        COUNT(es.id)::int AS "scheduledDays",
        COUNT(a.id)::int AS "recordedDays",
        COUNT(a.id) FILTER (WHERE a.status = 'LATE')::int AS "lateCount",
        COUNT(a.id) FILTER (WHERE a.status = 'ABSENT')::int AS "absentCount",
        ROUND(
          AVG(
            EXTRACT(HOUR FROM a."checkIn") * 60 + EXTRACT(MINUTE FROM a."checkIn")
          ) FILTER (WHERE a."checkIn" IS NOT NULL)
        )::int AS "averageArrivalMinutes"
      FROM "Employee" e
      JOIN "Department" d ON d.id = e."departmentId"
      JOIN "Role" r ON r.id = e."roleId"
      LEFT JOIN "EmployeeShift" es
        ON es."employeeId" = e.id
       AND es.date BETWEEN ${from}::date AND ${to}::date
      LEFT JOIN "Attendance" a
        ON a."employeeId" = e.id
       AND a.date BETWEEN ${from}::date AND ${to}::date
      WHERE e.status = 'ACTIVE'
      GROUP BY e.id, e."firstName", e."lastName", d.name, r.name
      HAVING COUNT(a.id) > 0 OR COUNT(es.id) > 0
      ORDER BY "lateCount" DESC, "absentCount" DESC, "fullName" ASC;
    `;
  },

  async getDashboardStats() {
    const today = todayUtc();
    const [employeeCount, activeEmployeeCount, departmentCount, todayPresent, todayAssignedShifts] = await Promise.all([
      prisma.employee.count(),
      prisma.employee.count({ where: { status: "ACTIVE" } }),
      prisma.department.count(),
      prisma.attendance.count({
        where: { date: today, status: { in: ["PRESENT", "LATE"] } },
      }),
      prisma.employeeShift.count({ where: { date: today } }),
    ]);

    return {
      employeeCount,
      activeEmployeeCount,
      departmentCount,
      todayPresent,
      todayExpected: activeEmployeeCount,
      todayAssignedShifts,
    };
  },
};
