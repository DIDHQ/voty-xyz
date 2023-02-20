import { NextApiRequest, NextApiResponse } from 'next'
import { deleteCookie, setCookie } from 'cookies-next'

import verifyAuth from '../../utils/verifiers/verify-auth'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method === 'POST') {
      await verifyAuth(req.body)
      setCookie('voty.user', JSON.stringify(req.body), {
        req,
        res,
        secure: true,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      })
      res.send(null)
      return
    }
    if (req.method === 'DELETE') {
      await verifyAuth(req.body)
      deleteCookie('voty.user', { req, res, secure: true })
      res.send(null)
      return
    }
  } catch (err) {
    console.error(err)
    res.status(400).send(null)
  }
}
