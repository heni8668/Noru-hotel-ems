import api from "../api/client";

export const roleService = {
  getAll: async () => {
    const { data } = await api.get("/roles");
    return data.data;
  },
  create: async (payload) => {
    const { data } = await api.post("/roles", payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/roles/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/roles/${id}`);
    return data;
  },
};
