import fetch from 'isomorphic-unfetch'

export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const response = await fetch(input, init)
  if (response.ok) {
    return response.json() as T
  }
  throw new FetchError(response.status, await response.text())
}

export class FetchError extends Error {
  status: number

  constructor(status: number, message?: string, options?: ErrorOptions) {
    super(message, options)
    this.status = status
  }
}
