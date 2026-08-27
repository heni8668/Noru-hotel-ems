import api from "../api/client";

export const employeeService = {
  getAll: async (params) => {
    const { data } = await api.get("/employees", { params });
    return data.data;
  },
  create: async (payload) => {
    const { data } = await api.post("/employees", payload);
    return data;
  },
  update: async (id, payload) => {
    const { data } = await api.put(`/employees/${id}`, payload);
    return data;
  },
  remove: async (id) => {
    const { data } = await api.delete(`/employees/${id}`);
    return data;
  },
};
