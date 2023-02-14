import { last } from 'lodash-es'
import { NextApiRequest, NextApiResponse } from 'next'

import { database } from '../../../utils/database'
import { proposalWithAuthorSchema } from '../../../utils/schemas'

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
    cursor: query.next ? { permalink: query.next } : undefined,
    where: query.group
      ? { entry: query.entry, group: query.group }
      : { entry: query.entry },
    take: 50,
    orderBy: { ts: 'desc' },
  })
  res.json({
    data: proposals
      .map(({ permalink, data }) => {
        try {
          return {
            permalink,
            ...proposalWithAuthorSchema.parse(
              JSON.parse(textDecoder.decode(data)),
            ),
          }
        } catch {
          return
        }
      })
      .filter((proposal) => proposal),
    next: last(proposals)?.permalink,
  })
}
