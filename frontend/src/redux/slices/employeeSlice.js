import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { employeeService } from "../../services/employeeService";
import { toThunkError } from "../../utils";

export const fetchEmployees = createAsyncThunk("employees/fetchAll", async (params, { rejectWithValue }) => {
  try {
    return await employeeService.getAll(params);
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

export const createEmployee = createAsyncThunk("employees/create", async (payload, { rejectWithValue }) => {
  try {
    return await employeeService.create(payload);
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

export const updateEmployee = createAsyncThunk("employees/update", async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    return await employeeService.update(id, payload);
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

export const deleteEmployee = createAsyncThunk("employees/delete", async (id, { rejectWithValue }) => {
  try {
    const result = await employeeService.remove(id);
    return { ...result, id };
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

const employeeSlice = createSlice({
  name: "employees",
  initialState: {
    items: [],
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not load employees.";
      })
      .addCase(createEmployee.pending, (state) => {
        state.saving = true;
      })
      .addCase(createEmployee.fulfilled, (state, action) => {
        state.saving = false;
        state.items.push(action.payload.data);
      })
      .addCase(createEmployee.rejected, (state) => {
        state.saving = false;
      })
      .addCase(updateEmployee.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateEmployee.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.map((item) => (item.id === action.payload.data.id ? action.payload.data : item));
      })
      .addCase(updateEmployee.rejected, (state) => {
        state.saving = false;
      })
      .addCase(deleteEmployee.pending, (state) => {
        state.saving = true;
      })
      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.filter((item) => item.id !== action.payload.id);
      })
      .addCase(deleteEmployee.rejected, (state) => {
        state.saving = false;
      });
  },
});

export default employeeSlice.reducer;
