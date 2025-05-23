import axios from "axios";

export const url = "http://localhost:3000";

export const axiosInstance = axios.create({
  baseURL: url,
});

// Add interceptor to always use the latest token
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.authorization = `Bearer ${token}`;
  }
  return config;
});
