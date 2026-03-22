import { createSlice } from "@reduxjs/toolkit";

const attemptSlice = createSlice({
  name: "attempt",
  initialState: {
    answers: {},
    status: "idle",
  },
  reducers: {
    saveAnswer: (state, action) => {
      const { questionId, answer } = action.payload;
      state.answers[questionId] = answer;
    },

    loadAttempt: (state, action) => {
      state.answers = action.payload;
    },

    clearAttempt: (state) => {
      state.answers = {};
    },
  },
});

export const { saveAnswer, loadAttempt, clearAttempt } =
  attemptSlice.actions;

export default attemptSlice.reducer;