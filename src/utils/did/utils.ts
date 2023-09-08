export function isSecondLevelDID(did: string) {
  return did.indexOf('.') !== did.lastIndexOf('.')
}

export function formatDid(did: string) {
  return isSecondLevelDID(did)
    ? did.substring(0, did.length - 4)
    : `.${did.split('.')[0]}`
}

export function unFormatDid(did: string) {
  return did.startsWith('.') ? `${did.substring(1)}.bit` : did
}
