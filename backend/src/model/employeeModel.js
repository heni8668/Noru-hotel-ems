import { prisma } from "../db/prisma.js";
import { mapPrismaError } from "../db/prismaErrors.js";

const include = {
  department: true,
  role: true,
};

export const employeeModel = {
  findAll(filters = {}) {
    const where = {};
    if (filters.departmentId) where.departmentId = filters.departmentId;
    if (filters.roleId) where.roleId = filters.roleId;
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search, mode: "insensitive" } },
        { lastName: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return prisma.employee.findMany({
      where,
      include,
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    });
  },

  findById(id) {
    return prisma.employee.findUnique({ where: { id }, include });
  },

  findByEmail(email) {
    return prisma.employee.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      include,
    });
  },

  async create(data) {
    try {
      return await prisma.employee.create({ data, include });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async update(id, data) {
    try {
      return await prisma.employee.update({ where: { id }, data, include });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async delete(id) {
    try {
      await prisma.employee.delete({ where: { id } });
    } catch (error) {
      mapPrismaError(error);
    }
  },
};
