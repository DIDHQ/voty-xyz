import { TRPCError } from '@trpc/server'

import { checkDidAuthorshipProof } from '../did'
import { Authorship } from '../schemas/basic/authorship'
import { Proof } from '../schemas/basic/proof'
import { isTestnet } from '../constants'
import { Snapshots } from '../types'
import { getSnapshotTimestamp } from '../snapshot'

export default async function verifyAuthorship(
  authorship: Authorship,
  proof: Proof,
  snapshots?: Snapshots,
): Promise<void> {
  if ((authorship.testnet || false) !== isTestnet) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Mainnet testnet mismatch',
    })
  }

  if (snapshots) {
    if (snapshots[authorship.coin_type] !== authorship.snapshot) {
      throw new TRPCError({ code: 'FORBIDDEN', message: 'Snapshot mismatch' })
    }
  } else {
    const timestamp = await getSnapshotTimestamp(
      authorship.coin_type,
      authorship.snapshot,
    )
    if (Date.now() - timestamp.getTime() > 30 * 60 * 1000) {
      throw new TRPCError({ code: 'BAD_REQUEST', message: 'Stale snapshot' })
    }
  }

  if (!(await checkDidAuthorshipProof(authorship, proof))) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Invalid authorship' })
  }
}
