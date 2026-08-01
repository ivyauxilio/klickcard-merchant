import axios from "axios";
import Cookies from "js-cookie";

// Base URL of your Laravel 12 API, e.g. http://localhost:8000/api
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    Accept: "application/json",
  },
});

// Attach the bearer token (Laravel Sanctum personal access token) on every request.
api.interceptors.request.use((config) => {
  const token = Cookies.get("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Centralize 401 handling: token is invalid/expired, so clear it and let the
// app redirect to /login via the AuthGuard component.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("auth_token");
    }
    return Promise.reject(error);
  }
);

// Normalizes Laravel's validation error shape ({ message, errors: {field: [msg]} })
// into a flat, easy-to-render object of { field: "message" }.
export function extractErrors(error) {
  const response = error?.response?.data;
  if (!response) {
    return { general: "Network error. Please check your connection and try again." };
  }
  if (response.errors) {
    const flat = {};
    Object.entries(response.errors).forEach(([field, messages]) => {
      flat[field] = Array.isArray(messages) ? messages[0] : messages;
    });
    return flat;
  }
  return { general: response.message || "Something went wrong. Please try again." };
}

export default api;
