import axios from "axios";
import store from "../app/store";

const api = axios.create({
  baseURL: "http://localhost:8000/api",
});

// Attach token automatically
api.interceptors.request.use((config) => {
  const state = store.getState();
  const token = state.auth.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;