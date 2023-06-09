import { z } from 'zod'
import { TRPCError } from '@trpc/server'

import { procedure, router } from '../trpc'
import { grantProposalSelectSchema } from '../../utils/schemas/v1/grant-proposal-select'
import { authorized } from '../../utils/schemas/basic/authorship'
import { proved } from '../../utils/schemas/basic/proof'
import verifyGrantProposalSelect from '../../utils/verifiers/verify-grant-proposal-select'
import verifyGrant from '../../utils/verifiers/verify-grant'
import verifyAuthorship from '../../utils/verifiers/verify-authorship'
import verifyProof from '../../utils/verifiers/verify-proof'
import { uploadToArweave } from '../../utils/upload'
import { database } from '../../utils/database'
import { Activity } from '../../utils/schemas/activity'

const schema = proved(authorized(grantProposalSelectSchema))

export const grantProposalSelectRouter = router({
  getByPermalink: procedure
    .input(z.object({ permalink: z.string().optional() }))
    .output(schema.nullable())
    .query(async ({ input }) => {
      if (!input.permalink) {
        throw new TRPCError({ code: 'BAD_REQUEST' })
      }

      const storage = await database.storage.findUnique({
        where: { permalink: input.permalink },
      })

      return storage ? schema.parse(storage.data) : null
    }),
  create: procedure
    .input(schema)
    .output(z.string())
    .mutation(async ({ input }) => {
      await verifyProof(input)
      const { grant, grantProposal } = await verifyGrantProposalSelect(input)
      await verifyAuthorship(input.authorship, input.proof, grant.snapshots)
      const { community } = await verifyGrant(grant)

      const permalink = await uploadToArweave(input)
      const ts = new Date()

      await database.$transaction([
        database.grantProposalSelect.create({
          data: {
            permalink,
            ts,
            selector: input.authorship.author,
            grantPermalink: grantProposal.grant,
            proposalPermalink: input.grant_proposal,
          },
        }),
        database.storage.create({ data: { permalink, data: input } }),
        database.grantProposal.update({
          where: { permalink: input.grant_proposal },
          data: { selected: permalink },
        }),
        database.grant.update({
          where: { permalink: grantProposal.grant },
          data: { selectedProposals: { increment: 1 } },
        }),
        database.activity.create({
          data: {
            communityId: community.id,
            actor: input.authorship.author,
            type: 'create_grant_proposal_select',
            data: {
              type: 'create_grant_proposal_select',
              community_id: community.id,
              community_permalink: grant.community,
              community_name: community.name,
              grant_permalink: grantProposal.grant,
              grant_name: grant.name,
              grant_proposal_permalink: input.grant_proposal,
              grant_proposal_title: grantProposal.title,
              grant_proposal_select_permalink: permalink,
            } satisfies Activity,
            ts,
          },
        }),
      ])

      return permalink
    }),
})

export type GrantProposalSelectRouter = typeof grantProposalSelectRouter
