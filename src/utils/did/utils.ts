export function isSubDID(did: string) {
  return did.indexOf('.') !== did.lastIndexOf('.')
}

export function formatDid(did: string) {
  return isSubDID(did) ? did.substring(0, did.length - 4) : did
}
