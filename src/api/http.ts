import axios, { type AxiosError } from 'axios'

export interface ApiErrorEnvelope {
  success?: boolean
  message?: string
  error?: string
  dateTime?: string
  info?: unknown
  data?: unknown
}

export class ApiRequestError extends Error {
  readonly status?: number
  readonly code?: string
  readonly info?: unknown

  constructor(message: string, status?: number, code?: string, info?: unknown) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = code
    this.info = info
  }
}

// VITE_API_BASE_URL is authoritative when set (see .env.example). Without it, development
// calls the Vite origin and lets the dev proxy forward /api and the /host API paths to the
// backend (first-party cookies, no local CORS); production keeps the documented fallback.
const LOCAL_BACKEND_FALLBACK = 'http://localhost:8080'

function defaultBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL
  if (configured) return configured.replace(/\/+$/, '')
  if (import.meta.env.DEV) return ''
  return LOCAL_BACKEND_FALLBACK
}

export function createApiClient(baseURL = defaultBaseUrl()) {
  const client = axios.create({
    baseURL: baseURL.replace(/\/+$/, ''),
    withCredentials: true,
    headers: { Accept: 'application/json' },
  })

  client.interceptors.response.use((response) => {
    const body: unknown = response.data
    if (body && typeof body === 'object' && 'success' in body) {
      const envelope = body as { success?: unknown; message?: unknown; error?: unknown; info?: unknown; data?: unknown }
      if (envelope.success === false) {
        const candidates = [envelope.message, envelope.error]
          .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
        const specific = candidates.find((value) => !/^(error|an error occurred|internal server error)$/i.test(value.trim()))
        throw new ApiRequestError(
          specific || candidates[0] || 'The request was not accepted.',
          response.status,
          typeof envelope.error === 'string' ? envelope.error : undefined,
          envelope.info,
        )
      }
      if (envelope.success === true && 'data' in envelope) response.data = envelope.data
    }
    return response
  })
  return client
}

export const apiClient = createApiClient()

export function normalizeApiError(error: unknown): ApiRequestError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorEnvelope>
    const body = axiosError.response?.data
    const envelope = body && typeof body === 'object' && 'data' in body && body.data && typeof body.data === 'object'
      ? body.data as ApiErrorEnvelope
      : body
    // The backend sometimes returns a placeholder `message` ("Error") alongside a concrete
    // `error` describing what actually failed; prefer the specific one so users see a cause.
    const candidates = [body?.message, envelope?.message, body?.error, envelope?.error]
      .filter((value): value is string => typeof value === 'string' && value.trim().length > 0)
    const specific = candidates.find((value) => !/^(error|an error occurred|internal server error)$/i.test(value.trim()))
    const message = specific || candidates[0] || (axiosError.response
      ? `The request failed (${axiosError.response.status}).`
      : 'Unable to reach Wandora. Check your connection and try again.')
    return new ApiRequestError(message, axiosError.response?.status, body?.error || envelope?.error, body?.info || envelope?.info)
  }
  return error instanceof ApiRequestError ? error : new ApiRequestError('Something went wrong. Please try again.')
}

export function getErrorMessage(error: unknown): string {
  return normalizeApiError(error).message
}
