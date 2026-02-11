// axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://10.69.46.173:3000", // Backend server URL
  headers: {
    "Content-Type": "application/json"
  }
});

export default api;
