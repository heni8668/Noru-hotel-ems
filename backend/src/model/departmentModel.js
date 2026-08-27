import { prisma } from "../db/prisma.js";
import { mapPrismaError } from "../db/prismaErrors.js";

export const departmentModel = {
  findAll() {
    return prisma.department.findMany({ orderBy: { name: "asc" } });
  },

  findById(id) {
    return prisma.department.findUnique({ where: { id } });
  },

  findByName(name) {
    return prisma.department.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
  },

  countEmployees(id) {
    return prisma.employee.count({ where: { departmentId: id } });
  },

  async create(data) {
    try {
      return await prisma.department.create({ data });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async update(id, data) {
    try {
      return await prisma.department.update({ where: { id }, data });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async delete(id) {
    try {
      await prisma.department.delete({ where: { id } });
    } catch (error) {
      mapPrismaError(error);
    }
  },
};
