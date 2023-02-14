export function id2Permalink(id: string) {
  return `ar://${id}`
}

export function permalink2Id(permalink: string) {
  return permalink.replace(/^ar:\/\//, '')
}

export function permalink2Url(permalink: string) {
  return `https://arseed.web3infra.dev/${permalink2Id(permalink)}`
}