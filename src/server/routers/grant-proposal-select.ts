import { z } from 'zod'

import { procedure, router } from '../trpc'
import { grantProposalSelectSchema } from '../../utils/schemas/v1/grant-proposal-select'
import { authorized } from '../../utils/schemas/basic/authorship'
import { proved } from '../../utils/schemas/basic/proof'
import verifyGrantProposalSelect from '../../utils/verifiers/verify-grant-proposal-select'
import verifyGrant from '../../utils/verifiers/verify-grant'
import verifyAuthorship from '../../utils/verifiers/verify-authorship'
import verifyProof from '../../utils/verifiers/verify-proof'
import verifySnapshot from '../../utils/verifiers/verify-snapshot'
import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'

const schema = proved(authorized(grantProposalSelectSchema))

export const grantProposalSelectRouter = router({
  create: procedure
    .input(schema)
    .output(z.string())
    .mutation(async ({ input }) => {
      await verifySnapshot(input.authorship)
      await verifyProof(input)
      await verifyAuthorship(input.authorship, input.proof)
      const { grant } = await verifyGrantProposalSelect(input)
      await verifyGrant(grant)

      const permalink = await uploadToArweave(input)

      await database.grantProposal.update({
        where: { permalink: input.grant_proposal },
        data: { selected: permalink },
      })

      return permalink
    }),
})

export type GrantProposalSelectRouter = typeof grantProposalSelectRouter
