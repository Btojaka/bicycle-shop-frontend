import axios from "axios";

// Instance for the API
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/api`, // Prefix for the API
  headers: {
    "Content-Type": "application/json",
  },
});

// Instance for the API Docs
export const docsApi = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/docs`, // Prefix for the API
  headers: {
    "Content-Type": "application/json",
  },
});
