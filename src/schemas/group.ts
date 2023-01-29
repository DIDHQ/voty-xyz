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
// [index: number]: Omit<VotingPowerUnit, ''> | Omit<VotingPowerSets, ''>
// https://github.com/react-hook-form/react-hook-form/issues/4055
type ProposerLibertyArray = Iterable<
  Omit<ProposerLibertyUnit, ''> | Omit<ProposerLibertySets, ''>
>
export type ProposerLibertySets = {
  operator: 'and' | 'or' | 'not'
  operands: ProposerLibertyArray
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
// [index: number]: Omit<VotingPowerUnit, ''> | Omit<VotingPowerSets, ''>
// https://github.com/react-hook-form/react-hook-form/issues/4055
type VotingPowerArray = Iterable<
  Omit<VotingPowerUnit, ''> | Omit<VotingPowerSets, ''>
>
export type VotingPowerSets = {
  operator: 'sum' | 'max' | 'sqrt'
  operands: VotingPowerArray
}

export const groupSchema = z.object({
  id: z.string().min(1),
  profile: z.object({
    name: z.string().min(1),
    about: z.string().optional(),
  }),
  proposer_liberty: proposerLibertySetsSchema,
  voting_power: votingPowerSetsSchema,
  rules: z.object({
    voting_duration: z.number(),
    voting_start_delay: z.number(),
    approval_condition_description: z.string(),
  }),
})
export type Group = z.infer<typeof groupSchema>
