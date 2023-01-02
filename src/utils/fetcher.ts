export async function fetchJson<T>(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  const response = await fetch(input, init)
  if (response.ok) {
    return response.json() as T
  }
  throw new Error(await response.text())
}
