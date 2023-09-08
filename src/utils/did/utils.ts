export function isSecondLevelDID(did: string) {
  return did.indexOf('.') !== did.lastIndexOf('.')
}

export function formatDid(did: string, enabledSecondLevel: boolean = true) {
  return isSecondLevelDID(did)
    ? did.substring(0, did.length - 4)
    : enabledSecondLevel
    ? `.${did.split('.')[0]}`
    : did
}

export function unFormatDid(did: string) {
  return did.startsWith('.') ? `${did.substring(1)}.bit` : did
}
