import { last } from 'lodash-es'
import { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../../utils/database'
import { optionWithAuthorSchema } from '../../../utils/schemas'

const textDecoder = new TextDecoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const query = req.query as {
    proposal: string
    next?: string
  }
  const options = await database.option.findMany({
    cursor: query.next ? { permalink: query.next } : undefined,
    where: { proposal: query.proposal },
    take: 50,
    orderBy: { ts: 'desc' },
  })
  res.json({
    data: options
      .map(({ permalink, data }) => {
        try {
          return {
            permalink,
            ...optionWithAuthorSchema.parse(
              JSON.parse(textDecoder.decode(data)),
            ),
          }
        } catch {
          return
        }
      })
      .filter((option) => option),
    next: last(options)?.permalink,
  })
}
