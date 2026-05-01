const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000";

export const fetchWithAuth = async (url, options = {}) => {
  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
  };

  // Cookies (accessToken & refreshToken) are automatically sent due to credentials: "include"
  let res = await fetch(`${API_BASE}${url}`, { ...options, headers, credentials: "include" });

  // If access token expired, try refresh
  if (res.status === 401) {
    const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (refreshRes.ok) {
      // Retry the original request (new accessToken cookie is now set)
      res = await fetch(`${API_BASE}${url}`, { ...options, headers, credentials: "include" });
    }
  }

  return res;
};