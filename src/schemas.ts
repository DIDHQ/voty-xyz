import { z } from 'zod'

export const proposerLibertyUnitSchema = z.object({
  function: z.string(),
  arguments: z.array(z.unknown()),
})
export type ProposerLibertyUnit = z.infer<typeof proposerLibertyUnitSchema>

export const proposerLibertySetsSchema: z.ZodType<ProposerLibertySets> = z.lazy(
  () =>
    z.union([
      z.object({
        operator: z.enum(['and', 'or']),
        operands: z
          .array(
            z.union([proposerLibertySetsSchema, proposerLibertyUnitSchema]),
          )
          .min(1),
      }),
      z.object({
        operator: z.enum(['not']),
        operands: z
          .array(
            z.union([proposerLibertySetsSchema, proposerLibertyUnitSchema]),
          )
          .length(1),
      }),
    ]),
)
export type ProposerLibertySets = {
  operator: 'and' | 'or' | 'not'
  operands: (ProposerLibertyUnit | ProposerLibertySets)[]
}

export const votingPowerUnitSchema = z.object({
  function: z.string(),
  arguments: z.array(z.unknown()),
})
export type VotingPowerUnit = z.infer<typeof votingPowerUnitSchema>

export const votingPowerSetsSchema: z.ZodType<VotingPowerSets> = z.lazy(() =>
  z.union([
    z.object({
      operator: z.enum(['sum', 'max']),
      operands: z
        .array(z.union([votingPowerSetsSchema, votingPowerUnitSchema]))
        .min(1),
    }),
    z.object({
      operator: z.enum(['sqrt']),
      operands: z
        .array(z.union([votingPowerSetsSchema, votingPowerUnitSchema]))
        .length(1),
    }),
  ]),
)
export type VotingPowerSets = {
  operator: 'sum' | 'max' | 'sqrt'
  operands: (VotingPowerUnit | VotingPowerSets)[]
}

export const organizationSchema = z.object({
  organization: z.string(),
  profile: z.object({
    avatar: z.string().optional(),
    name: z.string(),
    about: z.string().optional(),
    website: z.string().optional(),
    tos: z.string().optional(),
  }),
  communities: z.array(
    z.object({
      type: z.enum(['twitter', 'github', 'discord']),
      value: z.string(),
    }),
  ),
  workgroups: z.map(
    z.string(),
    z.object({
      profile: z.object({
        avatar: z.string().optional(),
        name: z.string(),
        about: z.string().optional(),
      }),
      proposer_liberty: proposerLibertySetsSchema,
      voting_power: votingPowerSetsSchema,
      rules: z.object({
        voting_duration: z.number(),
        voting_start_delay: z.number(),
        approval_condition_description: z.string(),
      }),
    }),
  ),
})
export type Organization = z.infer<typeof organizationSchema>
