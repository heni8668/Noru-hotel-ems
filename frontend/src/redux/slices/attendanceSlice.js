import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { attendanceService } from "../../services/attendanceService";
import { toThunkError } from "../../utils";

export const fetchAttendance = createAsyncThunk("attendance/fetchAll", async (params, { rejectWithValue }) => {
  try {
    return await attendanceService.getAll(params);
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

export const createAttendance = createAsyncThunk("attendance/create", async (payload, { rejectWithValue }) => {
  try {
    return await attendanceService.create(payload);
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

export const updateAttendance = createAsyncThunk("attendance/update", async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    return await attendanceService.update(id, payload);
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

export const deleteAttendance = createAsyncThunk("attendance/delete", async (id, { rejectWithValue }) => {
  try {
    const result = await attendanceService.remove(id);
    return { ...result, id };
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

const attendanceSlice = createSlice({
  name: "attendance",
  initialState: {
    items: [],
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAttendance.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAttendance.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAttendance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      .addCase(createAttendance.pending, (state) => {
        state.saving = true;
      })
      .addCase(createAttendance.fulfilled, (state, action) => {
        state.saving = false;
        state.items.unshift(action.payload.data);
      })
      .addCase(createAttendance.rejected, (state) => {
        state.saving = false;
      })
      .addCase(updateAttendance.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateAttendance.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.map((item) => (item.id === action.payload.data.id ? action.payload.data : item));
      })
      .addCase(updateAttendance.rejected, (state) => {
        state.saving = false;
      })
      .addCase(deleteAttendance.pending, (state) => {
        state.saving = true;
      })
      .addCase(deleteAttendance.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.filter((item) => item.id !== action.payload.id);
      })
      .addCase(deleteAttendance.rejected, (state) => {
        state.saving = false;
      });
  },
});

export default attendanceSlice.reducer;
