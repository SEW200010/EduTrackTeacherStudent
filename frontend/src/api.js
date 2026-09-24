import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "http://localhost:5000/api",
    headers: {
        "Content-Type": "application/json"
    }
});

// -----------------------------
// Request Interceptor
// හැම request එකකටම token attach කරනවා (login කරලා තියෙනවනම්)
// -----------------------------
API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// -----------------------------
// Response Interceptor (Optional but recommended)
// Token expire වුනොත් auto logout කරලා login page එකට යවනවා
// -----------------------------
API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default API;