import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { departmentService } from "../../services/departmentService";
import { toThunkError } from "../../utils";

export const fetchDepartments = createAsyncThunk("departments/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await departmentService.getAll();
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

export const createDepartment = createAsyncThunk("departments/create", async (payload, { rejectWithValue }) => {
  try {
    return await departmentService.create(payload);
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

export const updateDepartment = createAsyncThunk("departments/update", async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    return await departmentService.update(id, payload);
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

export const deleteDepartment = createAsyncThunk("departments/delete", async (id, { rejectWithValue }) => {
  try {
    const result = await departmentService.remove(id);
    return { ...result, id };
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

const departmentSlice = createSlice({
  name: "departments",
  initialState: {
    items: [],
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchDepartments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not load departments.";
      })
      .addCase(createDepartment.pending, (state) => {
        state.saving = true;
      })
      .addCase(createDepartment.fulfilled, (state, action) => {
        state.saving = false;
        state.items.push(action.payload.data);
        state.items.sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(createDepartment.rejected, (state) => {
        state.saving = false;
      })
      .addCase(updateDepartment.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateDepartment.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.map((item) => (item.id === action.payload.data.id ? action.payload.data : item));
      })
      .addCase(updateDepartment.rejected, (state) => {
        state.saving = false;
      })
      .addCase(deleteDepartment.pending, (state) => {
        state.saving = true;
      })
      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.filter((item) => item.id !== action.payload.id);
      })
      .addCase(deleteDepartment.rejected, (state) => {
        state.saving = false;
      });
  },
});

export default departmentSlice.reducer;
