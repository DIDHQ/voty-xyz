import { z } from 'zod'

export const booleanUnitSchema = z.object({
  function: z.string(),
  arguments: z.array(z.unknown()),
})
export type BooleanUnit = z.infer<typeof booleanUnitSchema>

export const booleanSetsSchema = z.object({
  operator: z.literal('or'),
  operands: z
    .array(
      z.object({
        operator: z.literal('and'),
        operands: z.array(booleanUnitSchema).min(1),
      }),
    )
    .min(1),
})
export type BooleanSets = z.infer<typeof booleanSetsSchema>

export const numberUnitSchema = z.object({
  function: z.string(),
  arguments: z.array(z.unknown()),
})
export type NumberUnit = z.infer<typeof numberUnitSchema>

export const numberSetsSchema = z.object({
  operator: z.enum(['sum', 'max']),
  operands: z.array(numberUnitSchema).min(1),
})
export type NumberSets = z.infer<typeof numberSetsSchema>
