import { createSlice } from "@reduxjs/toolkit";

const categorySlice = createSlice({
  name: "category",
  initialState: {
    isLoading: false,
    categories: [],
  },
  reducers: {
    getCategroyStart: (state) => {
      state.isLoading = true;
    },
    getCategorySuccess: (state, action) => {
      state.categories = action.payload;
      state.isLoading = false;
    },
    getCategoryFailure: (state) => {
      state.isLoading = false;
    },
  },
});

export const { getCategoryFailure, getCategorySuccess, getCategroyStart } =
  categorySlice.actions;

export default categorySlice.reducer;
