const tokenKey = "peopleflow_local_token";

async function request(path: string, init: RequestInit = {}) {
  const token = typeof window === "undefined" ? "" : localStorage.getItem(tokenKey) || "";
  const response = await fetch(`/local-api${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(token ? { authorization: `Bearer ${token}` } : {}), ...init.headers },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "本地服务请求失败");
  return data;
}

export const localApi = {
  async signup(email: string, password: string) {
    return request("/auth/signup", { method: "POST", body: JSON.stringify({ email, password }) });
  },
  async login(email: string, password: string) {
    const data = await request("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    localStorage.setItem(tokenKey, data.token);
    return data;
  },
  logout() { localStorage.removeItem(tokenKey); },
  me: () => request("/auth/me"),
  candidates: () => request("/candidates"),
  createCandidate: (value: unknown) => request("/candidates", { method: "POST", body: JSON.stringify(value) }),
  updateCandidate: (id: string, value: unknown) => request(`/candidates/${id}`, { method: "PATCH", body: JSON.stringify(value) }),
  deleteCandidate: (id: string) => request(`/candidates/${id}`, { method: "DELETE" }),
};
