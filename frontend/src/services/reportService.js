import api from "../api/client";

export const reportService = {
  getDashboard: async () => {
    const { data } = await api.get("/reports/dashboard");
    return data.data;
  },
  getAttendanceByDepartment: async (params) => {
    const { data } = await api.get("/reports/attendance-by-department", { params });
    return data.data;
  },
  getShiftCoverage: async (params) => {
    const { data } = await api.get("/reports/shift-coverage", { params });
    return data.data;
  },
  getPunctuality: async (params) => {
    const { data } = await api.get("/reports/punctuality", { params });
    return data.data;
  },
};
