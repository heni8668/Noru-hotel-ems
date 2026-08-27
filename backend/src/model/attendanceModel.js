import { prisma } from "../db/prisma.js";
import { mapPrismaError } from "../db/prismaErrors.js";

const include = {
  employee: { include: { department: true, role: true } },
};

export const attendanceModel = {
  findAll(filters = {}) {
    const where = {};
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.departmentId) where.employee = { departmentId: filters.departmentId };
    if (filters.status) where.status = filters.status;
    if (filters.from || filters.to) {
      where.date = {};
      if (filters.from) where.date.gte = filters.from;
      if (filters.to) where.date.lte = filters.to;
    }

    return prisma.attendance.findMany({
      where,
      include,
      orderBy: [{ date: "desc" }, { employee: { lastName: "asc" } }],
    });
  },

  findById(id) {
    return prisma.attendance.findUnique({ where: { id }, include });
  },

  findByEmployeeAndDate(employeeId, date) {
    return prisma.attendance.findUnique({
      where: { employeeId_date: { employeeId, date } },
    });
  },

  async create(data) {
    try {
      return await prisma.attendance.create({ data, include });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async update(id, data) {
    try {
      return await prisma.attendance.update({ where: { id }, data, include });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async delete(id) {
    try {
      await prisma.attendance.delete({ where: { id } });
    } catch (error) {
      mapPrismaError(error);
    }
  },
};
