import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { reportService } from "../../services/reportService";
import { toThunkError } from "../../utils";

export const fetchDashboard = createAsyncThunk("reports/dashboard", async (_, { rejectWithValue }) => {
  try {
    return await reportService.getDashboard();
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

export const fetchAttendanceByDepartment = createAsyncThunk(
  "reports/attendanceByDepartment",
  async (params, { rejectWithValue }) => {
    try {
      return await reportService.getAttendanceByDepartment(params);
    } catch (error) {
      return rejectWithValue(toThunkError(error));
    }
  },
);

export const fetchShiftCoverage = createAsyncThunk("reports/shiftCoverage", async (params, { rejectWithValue }) => {
  try {
    return await reportService.getShiftCoverage(params);
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

export const fetchPunctuality = createAsyncThunk("reports/punctuality", async (params, { rejectWithValue }) => {
  try {
    return await reportService.getPunctuality(params);
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

const reportSlice = createSlice({
  name: "reports",
  initialState: {
    dashboard: null,
    attendanceByDepartment: [],
    coverage: [],
    punctuality: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not load dashboard.";
      })
      .addCase(fetchAttendanceByDepartment.fulfilled, (state, action) => {
        state.attendanceByDepartment = action.payload;
      })
      .addCase(fetchShiftCoverage.fulfilled, (state, action) => {
        state.coverage = action.payload;
      })
      .addCase(fetchPunctuality.fulfilled, (state, action) => {
        state.punctuality = action.payload;
      });
  },
});

export default reportSlice.reducer;
