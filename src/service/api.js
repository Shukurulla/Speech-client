import axios from "axios";

axios.defaults.baseURL = "https://speech.kerek.uz/api";

axios.interceptors.request.use((option) => {
  const token = localStorage.getItem("speech-token")
    ? localStorage.getItem("speech-token")
    : "";
  option.headers.Authorization = `Bearer ${token}`;
  return option;
});

export default axios;
