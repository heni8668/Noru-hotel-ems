import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { shiftService } from "../../services/shiftService";
import { toThunkError } from "../../utils";

export const fetchShifts = createAsyncThunk("shifts/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await shiftService.getAll();
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

export const createShift = createAsyncThunk("shifts/create", async (payload, { rejectWithValue }) => {
  try {
    return await shiftService.create(payload);
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

export const updateShift = createAsyncThunk("shifts/update", async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    return await shiftService.update(id, payload);
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

export const deleteShift = createAsyncThunk("shifts/delete", async (id, { rejectWithValue }) => {
  try {
    const result = await shiftService.remove(id);
    return { ...result, id };
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

export const fetchAssignments = createAsyncThunk("shifts/fetchAssignments", async (params, { rejectWithValue }) => {
  try {
    return await shiftService.getAssignments(params);
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

export const assignShift = createAsyncThunk("shifts/assign", async (payload, { rejectWithValue }) => {
  try {
    return await shiftService.assign(payload);
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

export const unassignShift = createAsyncThunk("shifts/unassign", async (id, { rejectWithValue }) => {
  try {
    const result = await shiftService.unassign(id);
    return { ...result, id };
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

const shiftSlice = createSlice({
  name: "shifts",
  initialState: {
    items: [],
    assignments: [],
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchShifts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchShifts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchShifts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message;
      })
      .addCase(createShift.pending, (state) => {
        state.saving = true;
      })
      .addCase(createShift.fulfilled, (state, action) => {
        state.saving = false;
        state.items.push(action.payload.data);
      })
      .addCase(createShift.rejected, (state) => {
        state.saving = false;
      })
      .addCase(updateShift.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateShift.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.map((item) => (item.id === action.payload.data.id ? action.payload.data : item));
      })
      .addCase(updateShift.rejected, (state) => {
        state.saving = false;
      })
      .addCase(deleteShift.pending, (state) => {
        state.saving = true;
      })
      .addCase(deleteShift.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.filter((item) => item.id !== action.payload.id);
      })
      .addCase(deleteShift.rejected, (state) => {
        state.saving = false;
      })
      .addCase(fetchAssignments.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.assignments = action.payload;
      })
      .addCase(fetchAssignments.rejected, (state) => {
        state.loading = false;
      })
      .addCase(assignShift.pending, (state) => {
        state.saving = true;
      })
      .addCase(assignShift.fulfilled, (state, action) => {
        state.saving = false;
        state.assignments.push(action.payload.data);
      })
      .addCase(assignShift.rejected, (state) => {
        state.saving = false;
      })
      .addCase(unassignShift.pending, (state) => {
        state.saving = true;
      })
      .addCase(unassignShift.fulfilled, (state, action) => {
        state.saving = false;
        state.assignments = state.assignments.filter((item) => item.id !== action.payload.id);
      })
      .addCase(unassignShift.rejected, (state) => {
        state.saving = false;
      });
  },
});

export default shiftSlice.reducer;
