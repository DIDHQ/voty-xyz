import { providers } from 'ethers'
import invariant from 'tiny-invariant'
import { DID, Snapshots } from '../types'

const provider = new providers.StaticJsonRpcProvider(
  'https://rpc.ankr.com/eth',
  1,
)

export async function resolve_eth(
  did: DID<'eth'>,
  snapshots: Snapshots, // TODO: use snapshots
): Promise<{ coin_type: number; address: string }> {
  const address = await provider.resolveName(did)
  invariant(address)
  return {
    coin_type: 60,
    address,
  }
}
