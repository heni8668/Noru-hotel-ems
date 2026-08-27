import api from "../api/client";

export const departmentService = {
  getAll: async () => {
    const { data } = await api.get("/departments");
    return data.data;
  },
  create: async (payload) => {
    const { data } = await api.post("/departments", payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/departments/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/departments/${id}`);
    return data;
  },
};
