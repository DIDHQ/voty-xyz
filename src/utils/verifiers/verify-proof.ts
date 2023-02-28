import { TRPCError } from '@trpc/server'

import { Proved } from '../schemas/proof'
import { verifyDocument } from '../signature'
import { verifyMessage } from '../sdks/ethers'

export default async function verifyProof<T extends object>(
  document: Proved<T>,
): Promise<void> {
  const { proof, ...rest } = document

  if (!(await verifyDocument(rest, proof, verifyMessage))) {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Invalid proof' })
  }
}
