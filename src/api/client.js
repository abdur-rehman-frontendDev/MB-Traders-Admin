import { API_BASE_URL } from "../config";

const TOKEN_KEY = "mb_admin_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

/**
 * apiRequest('/admin/dashboard') or apiRequest('/products', { method: 'POST', body: {...} })
 * Attaches the saved admin token automatically unless auth: false is passed.
 * Throws a readable Error on any non-2xx response.
 */
export async function apiRequest(
  path,
  { method = "GET", body, auth = true } = {},
) {
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error(
      "Could not reach the server. Check that the backend is running and VITE_API_BASE_URL is correct.",
    );
  }

  let data = null;
  try {
    data = await response.json();
  } catch (parseErr) {
    // No JSON body — fine for some responses.
  }

  if (!response.ok) {
    const message =
      (data && data.error) || `Request failed with status ${response.status}`;
    throw new Error(message);
  }

  return data;
}
