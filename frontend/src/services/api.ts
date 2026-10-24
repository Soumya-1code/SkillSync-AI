import type { AuthResult, IntegrityResult, MatchResult, ResumeProfile, User } from "../types";

const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8001").replace(/\/$/, "");
const tokenKey = "skillsync_access_token";

export class ApiError extends Error {
  constructor(message: string, readonly kind: "network" | "validation" | "http", readonly status?: number) {
    super(message);
    this.name = "ApiError";
  }
}

export const getToken = () => sessionStorage.getItem(tokenKey);
export const saveToken = (token: string) => sessionStorage.setItem(tokenKey, token);
export const clearToken = () => sessionStorage.removeItem(tokenKey);

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch (reason) {
    if (reason instanceof TypeError) {
      throw new ApiError(
        `Cannot reach the SkillSync API at ${API_URL}. Check that the backend is running and allows this frontend origin through CORS.`,
        "network",
      );
    }
    throw reason;
  }
  if (!response.ok) {
    const payload = await response.json().catch(() => null) as { detail?: unknown } | null;
    const detail = payload?.detail;
    const message = typeof detail === "string"
      ? detail
      : Array.isArray(detail)
        ? detail.map((issue) => {
          if (!issue || typeof issue !== "object") return "";
          const item = issue as { loc?: unknown[]; msg?: unknown };
          const location = Array.isArray(item.loc) ? item.loc.filter((part) => part !== "body").join(" → ") : "";
          const explanation = typeof item.msg === "string" ? item.msg : "Invalid value";
          return location ? `${location}: ${explanation}` : explanation;
        }).filter(Boolean).join(". ")
        : "";
    throw new ApiError(message || `Request failed (${response.status}).`, response.status === 422 ? "validation" : "http", response.status);
  }
  return response.json() as Promise<T>;
}

async function upload<T>(path: string, fields: Record<string, string>, file: File): Promise<T> {
  const form = new FormData();
  form.set("file", file);
  Object.entries(fields).forEach(([key, value]) => form.set(key, value));
  return request<T>(path, { method: "POST", body: form });
}

export const api = {
  signup: (email: string, password: string) => request<AuthResult>("/auth/signup", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }),
  }),
  login: (email: string, password: string) => request<AuthResult>("/auth/login", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, password }),
  }),
  me: () => request<User>("/auth/me"),
  analyze: (file: File) => upload<ResumeProfile>("/api/resume/analyze", {}, file),
  biasBlind: (file: File) => upload<ResumeProfile>("/api/resume/bias-blind", {}, file),
  match: (file: File, jobDescription: string) => upload<MatchResult>("/api/match", { job_description: jobDescription }, file),
  integrity: (file: File, keywords: string) => upload<IntegrityResult>("/api/integrity", { keywords }, file),
};
