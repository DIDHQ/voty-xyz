import { initTRPC } from '@trpc/server'
import SuperJSON from 'superjson'

const t = initTRPC.context().create({
  transformer: SuperJSON,
})

export const router = t.router

export const procedure = t.procedure
