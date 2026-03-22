import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import examReducer from "../features/exam/examSlice";
import attemptReducer from "../features/attempt/attemptSlice";
import analyticsReducer from "../features/analytics/analyticsSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    exam: examReducer,
    attempt: attemptReducer,
    analytics: analyticsReducer,
  },
});

export default store;