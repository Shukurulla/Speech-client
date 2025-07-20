import { configureStore } from "@reduxjs/toolkit";
import UserReducer from "./slices/user.slice";
import CategoryReducer from "./slices/category.slice";

const store = configureStore({
  reducer: {
    user: UserReducer,
    category: CategoryReducer,
  },
  devTools: process.env.NODE_ENV != "production",
});
export default store;
