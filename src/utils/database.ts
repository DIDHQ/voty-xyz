import { drizzle } from 'drizzle-orm/planetscale-serverless'
import { connect as connectPlanetscale } from '@planetscale/database'

const connection = connectPlanetscale({
  host: process.env.DATABASE_HOST,
  username: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  // @see https://github.com/planetscale/database-js/pull/102
  fetch: (url, init) => {
    if (init) {
      delete init['cache']
    }
    return fetch(url, init)
  },
})

export const database = drizzle(connection)
