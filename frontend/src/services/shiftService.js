import api from "../api/client";

export const shiftService = {
  getAll: async () => {
    const { data } = await api.get("/shifts");
    return data.data;
  },
  create: async (payload) => {
    const { data } = await api.post("/shifts", payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/shifts/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/shifts/${id}`);
    return data;
  },
  getAssignments: async (params) => {
    const { data } = await api.get("/shifts/assignments", { params });
    return data.data;
  },
  assign: async (payload) => {
    const { data } = await api.post("/shifts/assignments", payload);
    return data;
  },
  unassign: async (id) => {
    const { data } = await api.delete(`/shifts/assignments/${id}`);
    return data;
  },
};
