import { Authorship } from '../schemas/authorship'
import { getSnapshotTimestamp } from '../snapshot'

export default async function verifySnapshot(authorship: Authorship) {
  const timestamp = await getSnapshotTimestamp(
    authorship.coin_type,
    authorship.snapshot,
  )
  if (Date.now() - timestamp.getTime() > 30 * 60 * 1000) {
    throw new Error('snapshot too old')
  }
}
