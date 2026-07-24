import axios from "axios";

const API = axios.create({
    baseURL:
    "https://edu-track-teacher-student-62v6-pewtxnghi.vercel.app/api"
});

export default API;