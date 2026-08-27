import { configureStore } from "@reduxjs/toolkit";
import attendanceReducer from "./slices/attendanceSlice";
import departmentReducer from "./slices/departmentSlice";
import employeeReducer from "./slices/employeeSlice";
import reportReducer from "./slices/reportSlice";
import roleReducer from "./slices/roleSlice";
import shiftReducer from "./slices/shiftSlice";

export const store = configureStore({
  reducer: {
    departments: departmentReducer,
    roles: roleReducer,
    employees: employeeReducer,
    shifts: shiftReducer,
    attendance: attendanceReducer,
    reports: reportReducer,
  },
});
