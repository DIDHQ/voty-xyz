import { Authorized } from './schemas'

export const authorizationMessage = 'Welcome to Voty'

export type Authorization = {
  message: string
}

export function getAuthorization() {
  if (typeof localStorage === 'undefined') {
    return
  }
  const did = localStorage.getItem('voty.current')
  if (!did) {
    return
  }
  return localStorage.getItem(`voty.${did}`)
}

export function setAuthorizationCurrent(did?: string) {
  if (did) {
    localStorage.setItem('voty.current', did)
  } else {
    localStorage.removeItem('voty.current')
  }
}

export function setAuthorization(authorization: Authorized<Authorization>) {
  localStorage.setItem(
    `voty.${authorization.author.did}`,
    JSON.stringify(authorization),
  )
}

export function parseAuthorization(text: string): Authorized<Authorization> {
  return JSON.parse(text)
}

export function verifyAuthorization(authorization: Authorization) {
  return authorization.message === authorizationMessage
}
