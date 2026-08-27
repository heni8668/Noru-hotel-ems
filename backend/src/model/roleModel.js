import { prisma } from "../db/prisma.js";
import { mapPrismaError } from "../db/prismaErrors.js";

export const roleModel = {
  findAll() {
    return prisma.role.findMany({ orderBy: { name: "asc" } });
  },

  findById(id) {
    return prisma.role.findUnique({ where: { id } });
  },

  findByName(name) {
    return prisma.role.findFirst({
      where: { name: { equals: name, mode: "insensitive" } },
    });
  },

  countEmployees(id) {
    return prisma.employee.count({ where: { roleId: id } });
  },

  async create(data) {
    try {
      return await prisma.role.create({ data });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async update(id, data) {
    try {
      return await prisma.role.update({ where: { id }, data });
    } catch (error) {
      mapPrismaError(error);
    }
  },

  async delete(id) {
    try {
      await prisma.role.delete({ where: { id } });
    } catch (error) {
      mapPrismaError(error);
    }
  },
};
