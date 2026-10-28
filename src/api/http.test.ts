import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AxiosHeaders } from 'axios'
import { createApiClient, getErrorMessage, normalizeApiError } from './http'
import type { AxiosAdapter, AxiosResponse, InternalAxiosRequestConfig } from 'axios'

describe('API configuration', () => {
  beforeEach(() => vi.clearAllMocks())

  it('uses the same-origin dev proxy by default and keeps the configured base URL override', () => {
    // In development the browser talks to the Vite origin; the dev server proxies /api and
    // the /host API paths to the backend. A configured VITE_API_BASE_URL always wins.
    expect(createApiClient().defaults.baseURL).toBe(import.meta.env.DEV ? '' : 'http://localhost:8080')
    expect(createApiClient('https://api.example.test').defaults.baseURL).toBe('https://api.example.test')
    expect(createApiClient('https://api.example.test/').defaults.baseURL).toBe('https://api.example.test')
  })

  it('configures credentialed cookie requests on the shared Axios client', () => {
    const client = createApiClient('http://localhost:8080')
    expect(client.defaults.withCredentials).toBe(true)
    expect(client.defaults.baseURL).toBe('http://localhost:8080')
  })

  it('installs no request interceptor, so nothing can bootstrap or attach a CSRF token', async () => {
    const client = createApiClient('http://localhost:8080')
    const handlers = (client.interceptors.request.handlers ?? []).filter(Boolean)
    const configs = await Promise.all(handlers.map((handler) => handler!.fulfilled!({
      method: 'post', url: '/api/me', baseURL: 'http://localhost:8080', headers: new AxiosHeaders(),
    } as never)))
    for (const config of configs) {
      expect(Object.keys(config.headers.toJSON()).filter((key) => /csrf|xsrf/i.test(key))).toEqual([])
    }
    expect(handlers).toHaveLength(0)
    expect((client.interceptors.response.handlers ?? []).filter(Boolean)).toHaveLength(1)
  })

  it('sends no CSRF-specific header on state-changing requests', async () => {
    const client = createApiClient('http://localhost:8080')
    const headerSnapshots: Record<string, unknown>[] = []
    client.defaults.adapter = (async (config: InternalAxiosRequestConfig) => {
      headerSnapshots.push(config.headers.toJSON())
      return { data: {}, status: 200, statusText: 'OK', headers: {}, config } as AxiosResponse
    }) as AxiosAdapter
    await client.post('/api/auth/logout')
    await client.patch('/api/me', { name: 'Traveler' })
    expect(headerSnapshots).toHaveLength(2)
    for (const snapshot of headerSnapshots) {
      expect(Object.keys(snapshot).filter((key) => /csrf|xsrf/i.test(key))).toEqual([])
    }
  })

  it('unwraps successful ApiResponse envelopes for endpoint functions', () => {
    const client = createApiClient('http://localhost:8080')
    const interceptor = client.interceptors.response.handlers![0]!.fulfilled!
    const response = { data: { success: true, message: 'Success', data: { token: 'csrf-token' } } } as AxiosResponse
    expect(interceptor(response)).toMatchObject({ data: { token: 'csrf-token' } })
  })

  it('turns a 2xx ApiResponse failure into an API error', () => {
    const client = createApiClient('http://localhost:8080')
    const interceptor = client.interceptors.response.handlers![0]!.fulfilled!
    const response = { status: 200, data: { success: false, message: 'Validation failed', error: 'INVALID', info: { field: 'name' } } } as AxiosResponse
    expect(() => interceptor(response)).toThrow(expect.objectContaining({
      name: 'ApiRequestError', message: 'Validation failed', status: 200, code: 'INVALID',
    }))
  })

  it('does not alter unwrapped response DTOs', () => {
    const client = createApiClient('http://localhost:8080')
    const interceptor = client.interceptors.response.handlers![0]!.fulfilled!
    const response = { data: { id: 42, name: 'Traveler' } } as AxiosResponse
    expect(interceptor(response)).toMatchObject({ data: { id: 42, name: 'Traveler' } })
  })

  it('normalizes direct and ApiResponse-wrapped backend error messages', () => {
    const backend = normalizeApiError({ isAxiosError: true, response: { status: 403, data: { message: 'Forbidden', error: 'DENIED' } } })
    const wrapped = normalizeApiError({ isAxiosError: true, response: { status: 400, data: { success: false, message: 'Bad request', data: { message: 'Validation failed', info: 'field' } } } })
    expect(backend.status).toBe(403)
    expect(backend.message).toBe('Forbidden')
    expect(wrapped.message).toBe('Bad request')
    expect(wrapped.info).toBe('field')
    expect(getErrorMessage(new Error('network'))).toBe('Something went wrong. Please try again.')
  })
})
