import api from "../api/client";

export const attendanceService = {
  getAll: async (params) => {
    const { data } = await api.get("/attendance", { params });
    return data.data;
  },
  create: async (payload) => {
    const { data } = await api.post("/attendance", payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/attendance/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/attendance/${id}`);
    return data;
  },
};
