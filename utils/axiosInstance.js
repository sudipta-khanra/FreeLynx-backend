// utils/axiosInstance.js
import axios from "axios";

// Create an Axios instance with base URL
const axiosInstance = axios.create({
  baseURL: "http://localhost:5000/api", // update if needed for production
});

// Add a request interceptor to include JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from localStorage and trim any whitespace
    const token = localStorage.getItem("token")?.trim();

    if (token) {
      // Attach token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Ensure no Authorization header is sent if token is missing
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => {
    // Handle request errors
    return Promise.reject(error);
  }
);

export default axiosInstance;
