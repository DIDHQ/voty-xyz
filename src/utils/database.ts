import { drizzle } from 'drizzle-orm/planetscale-serverless'
import { connect as connectPlanetscale } from '@planetscale/database'
import { table } from './schema'
import {
  DATABASE_HOST,
  DATABASE_PASSWORD,
  DATABASE_USERNAME,
} from '@/src/env/server'

const connection = connectPlanetscale({
  host: DATABASE_HOST,
  username: DATABASE_USERNAME,
  password: DATABASE_PASSWORD,
  // @see https://github.com/planetscale/database-js/pull/102
  fetch: (url, init) => {
    if (init) {
      delete init['cache']
    }
    return fetch(url, init)
  },
})

export const database = drizzle(connection, { schema: table })
