import { last } from 'lodash-es'
import { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../../src/database'
import { proposalWithAuthorSchema } from '../../../src/schemas'

const textDecoder = new TextDecoder()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const query = req.query as {
    entry: string
    group?: string
    next?: string
  }
  const proposals = await database.proposal.findMany({
    cursor: query.next ? { uri: query.next } : undefined,
    where: query.group
      ? { entry: query.entry, group: parseInt(query.group) }
      : { entry: query.entry },
    take: 50,
    orderBy: { ts: 'desc' },
  })
  res.json({
    data: proposals
      .map(({ uri, data }) => {
        try {
          return {
            uri,
            ...proposalWithAuthorSchema.parse(
              JSON.parse(textDecoder.decode(data)),
            ),
          }
        } catch {
          return
        }
      })
      .filter((proposal) => proposal),
    next: last(proposals)?.uri,
  })
}
