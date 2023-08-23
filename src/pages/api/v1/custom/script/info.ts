import { NextRequest } from 'next/server'
import { isTestnet } from '@/src/utils/constants'
export const runtime = 'edge'

const handler = async (req: NextRequest) => {
  return fetch(isTestnet ? 
    'https://test-subaccount-api.did.id/v1/custom/script/info' : 
    "https://subaccount-api.did.id/v1/custom/script/info", 
  {
    method: req.method,
    body: req.body,
  })
}

export default handler