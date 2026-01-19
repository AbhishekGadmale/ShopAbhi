const API_BASE = "http://13.48.193.189:5000";

export const fetchWithAuth = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  const headers = {
    ...(options.headers || {}),
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  let res = await fetch(`${API_BASE}${url}`, { ...options, headers, credentials: "include" });

  // If access token expired, try refresh
  if (res.status === 401) {
    const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      credentials: "include", // ✅ send cookie
    });

    if (refreshRes.ok) {
      const { accessToken } = await refreshRes.json();
      localStorage.setItem("token", accessToken);

      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${accessToken}`,
      };

      res = await fetch(`${API_BASE}${url}`, { ...options, headers: retryHeaders, credentials: "include" });
    }
  }

  return res;
};