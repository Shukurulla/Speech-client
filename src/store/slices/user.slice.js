import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    isLoading: false,
    user: {},
  },
  reducers: {
    getUserStart: (state) => {
      state.isLoading = true;
    },

    getUserSuccess: (state, action) => {
      state.user = action.payload;
      state.isLoading = false;
    },
    getUserFailure: (state) => {
      state.isLoading = false;
    },
  },
});

export const { getUserFailure, getUserStart, getUserSuccess } =
  userSlice.actions;

export default userSlice.reducer;
