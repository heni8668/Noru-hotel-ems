import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { roleService } from "../../services/roleService";
import { toThunkError } from "../../utils";

export const fetchRoles = createAsyncThunk("roles/fetchAll", async (_, { rejectWithValue }) => {
  try {
    return await roleService.getAll();
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

export const createRole = createAsyncThunk("roles/create", async (payload, { rejectWithValue }) => {
  try {
    return await roleService.create(payload);
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

export const updateRole = createAsyncThunk("roles/update", async ({ id, ...payload }, { rejectWithValue }) => {
  try {
    return await roleService.update(id, payload);
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

export const deleteRole = createAsyncThunk("roles/delete", async (id, { rejectWithValue }) => {
  try {
    const result = await roleService.remove(id);
    return { ...result, id };
  } catch (error) {
    return rejectWithValue(toThunkError(error));
  }
});

const roleSlice = createSlice({
  name: "roles",
  initialState: {
    items: [],
    loading: false,
    saving: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Could not load roles.";
      })
      .addCase(createRole.pending, (state) => {
        state.saving = true;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.saving = false;
        state.items.push(action.payload.data);
        state.items.sort((a, b) => a.name.localeCompare(b.name));
      })
      .addCase(createRole.rejected, (state) => {
        state.saving = false;
      })
      .addCase(updateRole.pending, (state) => {
        state.saving = true;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.map((item) => (item.id === action.payload.data.id ? action.payload.data : item));
      })
      .addCase(updateRole.rejected, (state) => {
        state.saving = false;
      })
      .addCase(deleteRole.pending, (state) => {
        state.saving = true;
      })
      .addCase(deleteRole.fulfilled, (state, action) => {
        state.saving = false;
        state.items = state.items.filter((item) => item.id !== action.payload.id);
      })
      .addCase(deleteRole.rejected, (state) => {
        state.saving = false;
      });
  },
});

export default roleSlice.reducer;
