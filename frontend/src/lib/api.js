// Central API client for the FoodLink AI backend.
//
// Set VITE_API_URL in frontend/.env to point at your running backend, e.g.
//   VITE_API_URL=http://localhost:8000/api/v1
// Falls back to localhost:8000 so `npm run dev` works out of the box
// against `uvicorn app.main:app` (default port 8000).

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1";

const TOKEN_KEY = "foodlink_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

class ApiError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.status = status;
    this.detail = detail;
  }
}

async function request(path, { method = "GET", body, auth = true, form = false } = {}) {
  const headers = {};
  if (!form) headers["Content-Type"] = "application/json";

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? (form ? body : JSON.stringify(body)) : undefined,
  });

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const detail = (data && data.detail) || res.statusText || "Request failed";
    throw new ApiError(
      typeof detail === "string" ? detail : JSON.stringify(detail),
      res.status,
      detail
    );
  }

  return data;
}

export const api = {
  // --- Auth ---
  signup: (payload) => request("/auth/signup", { method: "POST", body: payload, auth: false }),

  login: (email, password) => {
    const form = new URLSearchParams();
    form.set("username", email);
    form.set("password", password);
    return request("/auth/login", { method: "POST", body: form, auth: false, form: true });
  },

  me: () => request("/auth/me"),

  updateLocation: (latitude, longitude) =>
    request("/auth/me/location", { method: "PATCH", body: { latitude, longitude } }),

  // --- Donations ---
  createDonation: (payload) => request("/donations/", { method: "POST", body: payload }),
  listAvailableDonations: () => request("/donations/", { auth: false }),
  listMyDonations: () => request("/donations/my-donations"),
  claimDonation: (donationId) => request(`/donations/${donationId}/claim`, { method: "PATCH" }),
  completePickup: (donationId, pickupCode) =>
    request(`/donations/${donationId}/complete`, {
      method: "PATCH",
      body: { pickup_code: pickupCode },
    }),
  myClaims: () => request("/donations/my-claims"),

  // --- AI: matching, routing, impact, gamification ---
  getMatches: (donationId, limit = 5) =>
    request(`/ai/donations/${donationId}/matches?limit=${limit}`),
  getOptimizedRoute: () => request("/ai/routes/optimize"),
  getImpact: () => request("/ai/impact", { auth: false }),
  getLeaderboard: (limit = 10) => request(`/ai/leaderboard?limit=${limit}`, { auth: false }),
};

export { ApiError };
