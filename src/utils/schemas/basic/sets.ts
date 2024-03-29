import { z } from 'zod'

import { positiveDecimalSchema } from './positive-decimal'

export const booleanUnitSchema = z.discriminatedUnion('function', [
  z.object({
    name: z.string().optional(),
    function: z.literal('prefixes_dot_suffix_exact_match'),
    arguments: z.tuple([
      z.string().min(1),
      z
        .array(z.string().min(1, 'Required'))
        .refine(
          (did_list) => did_list.every((did) => did.indexOf('.') === -1),
          { message: 'Invalid DID list' },
        ),
    ]),
  }),
])

export type BooleanUnit = z.infer<typeof booleanUnitSchema>

export const booleanSetsSchema = z.object({
  operation: z.literal('or'),
  operands: z.array(booleanUnitSchema).min(1, 'At least 1 group'),
})

export type BooleanSets = z.infer<typeof booleanSetsSchema>

export const decimalUnitSchema = z.discriminatedUnion('function', [
  z.object({
    name: z.string().min(1, 'Required'),
    function: z.literal('prefixes_dot_suffix_fixed_power'),
    arguments: z.tuple([
      z.string().min(1),
      z
        .array(z.string().min(1, 'Required'))
        .refine(
          (did_list) => did_list.every((did) => did.indexOf('.') === -1),
          { message: 'Invalid DID list' },
        ),
      positiveDecimalSchema,
    ]),
  }),
])

export type DecimalUnit = z.infer<typeof decimalUnitSchema>

export const decimalSetsSchema = z.object({
  operation: z.literal('max'),
  operands: z.array(decimalUnitSchema).min(1, 'At least 1 group'),
})

export type DecimalSets = z.infer<typeof decimalSetsSchema>
