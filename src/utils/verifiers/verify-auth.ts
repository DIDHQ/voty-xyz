import { Auth } from '../schemas/auth'
import { Authorized, Authorship } from '../schemas/authorship'
import { Proof, Proved } from '../schemas/proof'
import verifyAuthorshipProof from './verify-authorship-proof'

export default async function verifyAuth(
  document: Proved<Authorized<Auth>>,
): Promise<{ authorship: Authorship; proof: Proof }> {
  if (document.message !== 'welcome to voty') {
    throw new Error('invalid message')
  }

  return verifyAuthorshipProof(document)
}
