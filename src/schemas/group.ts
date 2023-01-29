import { z } from 'zod'

export const booleanUnitSchema = z.object({
  function: z.string(),
  arguments: z.array(z.unknown()),
})
export type BooleanUnit = z.infer<typeof booleanUnitSchema>

export const booleanSetsSchema: z.ZodType<ProposerLibertySets> = z.lazy(() =>
  z.union([
    z.object({
      operator: z.enum(['and', 'or']),
      operands: z.array(z.union([booleanSetsSchema, booleanUnitSchema])).min(1),
    }),
    z.object({
      operator: z.enum(['not']),
      operands: z
        .array(z.union([booleanSetsSchema, booleanUnitSchema]))
        .length(1),
    }),
  ]),
)
// https://github.com/react-hook-form/react-hook-form/issues/4055
type BooleanArray = Iterable<
  Omit<BooleanUnit, ''> | Omit<ProposerLibertySets, ''>
>
export type ProposerLibertySets = {
  operator: 'and' | 'or' | 'not'
  operands: BooleanArray
}

export const numberUnitSchema = z.object({
  function: z.string(),
  arguments: z.array(z.unknown()),
})
export type NumberUnit = z.infer<typeof numberUnitSchema>

export const numberSetsSchema: z.ZodType<NumberSets> = z.lazy(() =>
  z.union([
    z.object({
      operator: z.enum(['sum', 'max']),
      operands: z.array(z.union([numberSetsSchema, numberUnitSchema])).min(1),
    }),
    z.object({
      operator: z.enum(['sqrt']),
      operands: z
        .array(z.union([numberSetsSchema, numberUnitSchema]))
        .length(1),
    }),
  ]),
)
// https://github.com/react-hook-form/react-hook-form/issues/4055
type NumberArray = Iterable<Omit<NumberUnit, ''> | Omit<NumberSets, ''>>
export type NumberSets = {
  operator: 'sum' | 'max' | 'sqrt'
  operands: NumberArray
}

export const groupSchema = z.object({
  name: z.string().min(1),
  proposal_rights: booleanSetsSchema,
  voting_power: numberSetsSchema,
  add_option_rights: booleanSetsSchema.optional(),
  timing: z.object({
    publicity: z.number(),
    voting: z.number(),
    adding_option: z.number(),
  }),
  extension: z.object({
    id: z.string().min(1),
    about: z.string().optional(),
  }),
})
export type Group = z.infer<typeof groupSchema>
