import { TRPCError } from '@trpc/server'

import { checkDidAuthorshipProof } from '../did'
import { Authorship } from '../schemas/authorship'
import { Proof } from '../schemas/proof'
import { isTestnet } from '../constants'

export default async function verifyAuthorship(
  authorship: Authorship,
  proof: Proof,
): Promise<void> {
  if ((authorship.testnet || false) !== isTestnet) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: 'Mainnet testnet mismatch',
    })
  }

  if (!(await checkDidAuthorshipProof(authorship, proof))) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Invalid authorship' })
  }
}
