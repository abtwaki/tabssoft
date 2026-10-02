const API_BASE = import.meta.env.VITE_API_BASE || "/api";

let accessToken = localStorage.getItem("tsg_access") || null;
let refreshToken = localStorage.getItem("tsg_refresh") || null;
let refreshPromise = null;

export function setTokens(access, refresh) {
  accessToken = access;
  if (refresh !== undefined) refreshToken = refresh;
  if (access) localStorage.setItem("tsg_access", access);
  else localStorage.removeItem("tsg_access");
  if (refreshToken) localStorage.setItem("tsg_refresh", refreshToken);
  else localStorage.removeItem("tsg_refresh");
}

export function getAccessToken() {
  return accessToken;
}

export function getRefreshToken() {
  return refreshToken;
}

async function doRefresh() {
  if (!refreshToken) return false;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh: refreshToken }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    setTokens(data.access);
    return true;
  } catch {
    return false;
  }
}

export async function api(path, { method = "GET", body, auth = true, raw } = {}) {
  const headers = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth && accessToken) headers["Authorization"] = `Bearer ${accessToken}`;

  let res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && refreshToken) {
    refreshPromise = refreshPromise || doRefresh();
    const ok = await refreshPromise;
    refreshPromise = null;
    if (ok) {
      headers["Authorization"] = `Bearer ${accessToken}`;
      res = await fetch(`${API_BASE}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });
    } else {
      setTokens(null, null);
      window.location.href = "/login";
      throw new ApiError("Session expired", 401, {});
    }
  }

  if (raw) return res;

  let data = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  if (!res.ok) {
    throw new ApiError(
      (data && (data.detail || data.message)) || `Request failed (${res.status})`,
      res.status,
      data || {}
    );
  }
  return data;
}

export class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.status = status;
    this.data = data;
  }
}
