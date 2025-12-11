import axios from "axios";

const instance = axios.create({
  baseURL: "https://medtrack-backend-7mw8.onrender.com/api",
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
