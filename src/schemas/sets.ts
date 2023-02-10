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
    arguments: z.tuple([z.array(z.string().min(1)).min(1)]),
  }),
  z.object({
    alias: z.string().optional(),
    function: z.literal('sub_did'),
    arguments: z.tuple([z.array(z.string().min(1)).min(1)]),
  }),
])
export type BooleanUnit = z.infer<typeof booleanUnitSchema>

export const booleanSetsSchema = z.object({
  operation: z.literal('or'),
  operands: z.array(booleanUnitSchema).min(1),
})
export type BooleanSets = z.infer<typeof booleanSetsSchema>

export const numberUnitSchema = z.discriminatedUnion('function', [
  z.object({
    alias: z.string().optional(),
    function: z.literal('all'),
    arguments: z.tuple([z.number().gt(0)]),
  }),
  z.object({
    alias: z.string().optional(),
    function: z.literal('did'),
    arguments: z.tuple([z.number().gt(0), z.array(z.string().min(1)).min(1)]),
  }),
  z.object({
    alias: z.string().optional(),
    function: z.literal('sub_did'),
    arguments: z.tuple([z.number().gt(0), z.array(z.string().min(1)).min(1)]),
  }),
])
export type NumberUnit = z.infer<typeof numberUnitSchema>

export const numberSetsSchema = z.object({
  operation: z.literal('max'),
  operands: z.array(numberUnitSchema).min(1),
})
export type NumberSets = z.infer<typeof numberSetsSchema>
