import { last } from 'lodash-es'
import { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../../src/database'
import { optionWithAuthorSchema } from '../../../src/schemas'

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
    cursor: query.next ? { uri: query.next } : undefined,
    where: { proposal: query.proposal },
    take: 50,
    orderBy: { ts: 'desc' },
  })
  res.json({
    data: options
      .map(({ uri, data }) => {
        try {
          return {
            uri,
            ...optionWithAuthorSchema.parse(
              JSON.parse(textDecoder.decode(data)),
            ),
          }
        } catch {
          return
        }
      })
      .filter((option) => option),
    next: last(options)?.uri,
  })
}
