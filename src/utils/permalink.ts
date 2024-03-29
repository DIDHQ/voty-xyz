import { arweaveHost } from './constants'

export function isPermalink(permalink: string) {
  return permalink.startsWith('ar://')
}

export function id2Permalink(id: string) {
  return `ar://${id}`
}

export function permalink2Id(permalink: string) {
  return permalink.replace(/^ar:\/\//, '')
}

export function permalink2Explorer(permalink: string) {
  return `https://viewblock.io/arweave/tx/${permalink2Id(permalink)}`
}

export function permalink2Gateway(permalink: string) {
  return `https://${arweaveHost}/${permalink2Id(permalink)}`
}
