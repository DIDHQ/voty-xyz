import { z } from 'zod'

export const booleanUnitSchema = z.discriminatedUnion('function', [
  z.object({
    alias: z.string().optional(),
    function: z.literal('all'),
    arguments: z.tuple([]),
  }),
  z.object({
    alias: z.string().optional(),
    function: z.literal('did'),
    arguments: z.tuple([z.array(z.string())]),
  }),
  z.object({
    alias: z.string().optional(),
    function: z.literal('sub_did'),
    arguments: z.tuple([z.array(z.string())]),
  }),
])
export type BooleanUnit = z.infer<typeof booleanUnitSchema>

export const booleanSetsSchema = z.object({
  operator: z.literal('or'),
  operands: z.array(booleanUnitSchema).min(1),
})
export type BooleanSets = z.infer<typeof booleanSetsSchema>

export const numberUnitSchema = z.discriminatedUnion('function', [
  z.object({
    alias: z.string().optional(),
    function: z.literal('all'),
    arguments: z.tuple([z.number()]),
  }),
  z.object({
    alias: z.string().optional(),
    function: z.literal('did'),
    arguments: z.tuple([z.number(), z.array(z.string())]),
  }),
  z.object({
    alias: z.string().optional(),
    function: z.literal('sub_did'),
    arguments: z.tuple([z.number(), z.array(z.string())]),
  }),
])
export type NumberUnit = z.infer<typeof numberUnitSchema>

export const numberSetsSchema = z.object({
  operator: z.literal('max'),
  operands: z.array(numberUnitSchema).min(1),
})
export type NumberSets = z.infer<typeof numberSetsSchema>
