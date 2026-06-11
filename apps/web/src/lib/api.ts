/**
 * API client for the devv.tools server (apps/server).
 * Set VITE_API_URL in production; defaults to the local dev server.
 */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:8000"

export interface ApiError {
  code: string
  message: string
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    })
  } catch {
    throw new Error("Could not reach the devv.tools API server. Is it running?")
  }

  if (!res.ok) {
    let message = `Request failed (${res.status})`
    try {
      const body = await res.json()
      if (body?.error?.message) message = body.error.message
      else if (body?.detail) message = typeof body.detail === "string" ? body.detail : message
    } catch { /* keep generic message */ }
    throw new Error(message)
  }
  return res.json() as Promise<T>
}
