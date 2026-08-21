import axios from "axios";

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

let currentToken: string | null = null;
let refreshPromise: Promise<string> | null = null;

export const setToken = (token: string | null) => {
  currentToken = token;
};

api.interceptors.request.use((config) => {
  if (currentToken) {
    config.headers.Authorization = `Bearer ${currentToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const orig = err.config;
    if (err.response?.status !== 401 || orig._retry) return Promise.reject(err);

    const isLoginRoute = orig.url?.includes("/auth/google") || orig.url?.includes("/auth/guest") || orig.url?.includes("/auth/refresh");
    if (isLoginRoute) return Promise.reject(err);

    orig._retry = true;

    if (!refreshPromise) {
      refreshPromise = (async () => {
        try {
          const res = await api.post('/auth/refresh', {});
          const newToken = res.data.accessToken;
          setToken(newToken);
          return newToken;
        } catch (e) {
          setToken(null);
          refreshPromise = null;
          if (typeof window !== "undefined" && !window.location.pathname.includes('/login')) {
            window.location.href = "/login";
          }
          throw e;
        }
      })();
    }

    try {
      const newToken = await refreshPromise;
      orig.headers.Authorization = `Bearer ${newToken}`;
      return api(orig);
    } finally {
      refreshPromise = null;
    }
  }
);
