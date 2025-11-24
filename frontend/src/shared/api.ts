import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
});

// 요청 보낼 때 토큰 자동 첨부
api.interceptors.request.use(async config => {
    let token: string | undefined;

    if ((globalThis as any).chrome?.storage?.local) {
        const stored = await chrome.storage.local.get("accessToken");
        token = stored.accessToken;
    } else {
        token = localStorage.getItem("accessToken") || undefined;
    }

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

export default api;
