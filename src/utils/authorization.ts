import { Authorized } from './schemas/authorship'
import { isTestnet } from './testnet'

export const authorizationMessage = 'Welcome to Voty'

export type Authorization = {
  message: string
}

export function getAuthorization() {
  if (typeof localStorage === 'undefined') {
    return
  }
  const did = localStorage.getItem(`${isTestnet ? 'testnet.' : ''}voty.current`)
  if (!did) {
    return
  }
  return localStorage.getItem(`${isTestnet ? 'testnet.' : ''}voty.${did}`)
}

export function setAuthorizationCurrent(did?: string) {
  if (did) {
    localStorage.setItem(`${isTestnet ? 'testnet.' : ''}voty.current`, did)
  } else {
    localStorage.removeItem(`${isTestnet ? 'testnet.' : ''}voty.current`)
  }
}

export function setAuthorization(authorization: Authorized<Authorization>) {
  localStorage.setItem(
    `${isTestnet ? 'testnet.' : ''}voty.${authorization.authorship.did}`,
    JSON.stringify(authorization),
  )
}

export function parseAuthorization(text: string): Authorized<Authorization> {
  return JSON.parse(text)
}

export function verifyAuthorization(authorization: Authorization) {
  return authorization.message === authorizationMessage
}
