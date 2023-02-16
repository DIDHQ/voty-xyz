import { Authorized } from './schemas/authorship'
import { Proved } from './schemas/proof'
import { isTestnet } from './testnet'

export const authorizationMessage = 'Welcome to Voty'

export type Authorization = {
  message: string
}

export function getAuthorization() {
  if (typeof localStorage === 'undefined') {
    return
  }
  const address = localStorage.getItem(
    `${isTestnet ? 'testnet.' : ''}voty.current`,
  )
  if (!address) {
    return
  }
  return localStorage.getItem(`${isTestnet ? 'testnet.' : ''}voty.${address}`)
}

export function setAuthorizationCurrent(address?: string) {
  if (address) {
    localStorage.setItem(`${isTestnet ? 'testnet.' : ''}voty.current`, address)
  } else {
    localStorage.removeItem(`${isTestnet ? 'testnet.' : ''}voty.current`)
  }
}

export function setAuthorization(
  authorization: Proved<Authorized<Authorization>>,
) {
  localStorage.setItem(
    `${isTestnet ? 'testnet.' : ''}voty.${authorization.proof.address}`,
    JSON.stringify(authorization),
  )
}

export function parseAuthorization(
  text: string,
): Proved<Authorized<Authorization>> {
  return JSON.parse(text)
}

export function verifyAuthorization(authorization: Authorization) {
  return authorization.message === authorizationMessage
}
