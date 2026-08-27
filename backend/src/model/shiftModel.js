import { prisma } from "../db/prisma.js";
import { mapPrismaError } from "../db/prismaErrors.js";

const assignmentInclude = {
  shift: true,
  employee: { include: { department: true, role: true } },
};

export const shiftModel = {
  findAll() {
    return prisma.shift.findMany({ orderBy: { startTime: "asc" } });
  },

  findById(id) {
    return prisma.shift.findUnique({ where: { id } });
  },

  findByName(name) {
    return prisma.shift.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
  },

  countAssignments(id) {
    return prisma.employeeShift.count({ where: { shiftId: id } });
  },

  async create(data) {
    try {
      return await prisma.shift.create({ data });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async update(id, data) {
    try {
      return await prisma.shift.update({ where: { id }, data });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async delete(id) {
    try {
      await prisma.shift.delete({ where: { id } });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  findAssignments(filters = {}) {
    const where = {};
    if (filters.employeeId) where.employeeId = filters.employeeId;
    if (filters.shiftId) where.shiftId = filters.shiftId;
    if (filters.departmentId) where.employee = { departmentId: filters.departmentId };
    if (filters.from || filters.to) {
      where.date = {};
      if (filters.from) where.date.gte = filters.from;
      if (filters.to) where.date.lte = filters.to;
    }

    return prisma.employeeShift.findMany({
      where,
      include: assignmentInclude,
      orderBy: [{ date: "asc" }, { shift: { startTime: "asc" } }],
    });
  },

  findAssignmentById(id) {
    return prisma.employeeShift.findUnique({ where: { id }, include: assignmentInclude });
  },

  findAssignmentByEmployeeAndDate(employeeId, date) {
    return prisma.employeeShift.findUnique({
      where: { employeeId_date: { employeeId, date } },
      include: assignmentInclude,
    });
  },

  async createAssignment(data) {
    try {
      return await prisma.employeeShift.create({ data, include: assignmentInclude });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async deleteAssignment(id) {
    try {
      await prisma.employeeShift.delete({ where: { id } });
    } catch (error) {
      mapPrismaError(error);
    }
  },
};
