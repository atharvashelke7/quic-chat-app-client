import { configureStore } from "@reduxjs/toolkit";
import loaderReducer from "./loaderSlice";
import userReducer from "./userSlice";

const store = configureStore({
  reducer: { loaderReducer, userReducer }, // saving the state inside the store
});

export default store;
