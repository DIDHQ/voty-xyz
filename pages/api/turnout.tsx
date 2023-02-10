import { keyBy, mapValues, sumBy } from 'lodash-es'
import { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../src/database'
import { Turnout } from '../../src/types'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const query = req.query as {
    proposal: string
  }

  const choices = await database.turnout.findMany({
    where: {
      proposal: query.proposal,
    },
  })

  res.json({
    powers: mapValues(
      keyBy(choices, ({ option }) => option),
      ({ power }) => power,
    ),
    total: sumBy(choices, ({ power }) => power),
  } satisfies Turnout)
}
