import { z } from 'zod'

export const basicOembedDataSchema = z.object({
  version: z.string(),
  title: z.string().optional(),
  author_name: z.string().optional(),
  author_url: z.string().optional(),
  provider_name: z.string().optional(),
  provider_url: z.string().optional(),
  cache_age: z.union([z.string(), z.number()]).optional(),
  thumbnail_url: z.string().optional(),
  thumbnail_width: z.number().optional(),
  thumbnail_height: z.number().optional(),
})

export const linkOembedDataSchema = basicOembedDataSchema.extend({
  type: z.literal('link'),
})

export const photoOembedDataSchema = basicOembedDataSchema.extend({
  type: z.literal('photo'),
  url: z.string(),
  width: z.number(),
  height: z.number(),
})

export const videoOembedDataSchema = basicOembedDataSchema.extend({
  type: z.literal('video'),
  html: z.string(),
  width: z.number(),
  height: z.number(),
})

export const richOembedDataSchema = basicOembedDataSchema.extend({
  type: z.literal('rich'),
  url: z.string(),
  width: z.number(),
  height: z.number(),
})

export const oembedDataSchema = z.discriminatedUnion('type', [
  linkOembedDataSchema,
  photoOembedDataSchema,
  videoOembedDataSchema,
  richOembedDataSchema,
])

export type BasicOembedDataSchema = z.TypeOf<typeof basicOembedDataSchema>

export type LinkOembedDataSchema = z.TypeOf<typeof linkOembedDataSchema>

export type PhotoOembedDataSchema = z.TypeOf<typeof photoOembedDataSchema>

export type VideoOembedDataSchema = z.TypeOf<typeof videoOembedDataSchema>

export type RichOembedDataSchema = z.TypeOf<typeof richOembedDataSchema>

export type OembedDataSchema = z.TypeOf<typeof oembedDataSchema>
