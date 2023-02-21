export function id2Permalink(id: string) {
  return `ar://${id}`
}

export function permalink2Id(permalink: string) {
  return permalink.replace(/^ar:\/\//, '')
}

export function permalink2Url(permalink: string) {
  return `https://arweave.net/${permalink2Id(permalink)}`
}

export function permalink2Explorer(permalink: string) {
  return `https://viewblock.io/arweave/tx/${permalink2Id(permalink)}`
}
