import { createSlice } from "@reduxjs/toolkit";

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    score: 0,
    total: 0,
    weakTopics: [],
  },
  reducers: {
    setAnalytics: (state, action) => {
      // Expecting { score, total, weakTopics } in action.payload
      state.score = action.payload.score;
      state.total = action.payload.total;
      state.weakTopics = action.payload.weakTopics;
    },
  },
});

export const { setAnalytics } = analyticsSlice.actions;
export default analyticsSlice.reducer;