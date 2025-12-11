import axios from "axios";

// Automatically switch between local & production
const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://medtrack-backend-7mw8.onrender.com/api";

const instance = axios.create({
  baseURL: BASE_URL,
});

// Attach token on every request
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default instance;
