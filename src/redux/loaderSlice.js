import { createSlice } from "@reduxjs/toolkit";

const loaderSlice = createSlice({
  name: "loader",
  initialState: { loader: false }, // need to create an object and add the property 
  reducers: {
    showLoader: (state) => {
      state.loader = true; // throw this we can update the state of 'loader'
    },
    hideLoader: (state) => {
      state.loader = false;
    },
  },
});

export const { showLoader, hideLoader } = loaderSlice.actions; // returns the reducers showloader and hideloader
export default loaderSlice.reducer;
