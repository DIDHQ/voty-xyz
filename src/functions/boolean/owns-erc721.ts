import { providers } from 'ethers'
import { uniq } from 'lodash-es'
import invariant from 'tiny-invariant'

import { Erc721__factory } from '../../../types/ethers-contracts'
import {
  chainIdToCoinType,
  chainIdToRpc,
  coinTypeToChainId,
} from '../../constants'
import { requiredCoinTypesOfDidResolver, resolveDid } from '../../did'
import { BooleanFunction } from '../types'

export const owns_erc721: BooleanFunction<[number, string]> = (
  evm_chain_id,
  token_contract_address,
) => {
  invariant(chainIdToCoinType[evm_chain_id])
  const rpc = chainIdToRpc[evm_chain_id]
  invariant(rpc)
  const provider = new providers.StaticJsonRpcProvider(rpc, 1)
  const contract = Erc721__factory.connect(token_contract_address, provider)

  return {
    requiredCoinTypes: uniq([
      ...requiredCoinTypesOfDidResolver,
      chainIdToCoinType[evm_chain_id],
    ]),
    execute: async (did, snapshots) => {
      const { coinType, address } = await resolveDid(did, snapshots)
      if (coinTypeToChainId[coinType] === undefined) {
        return false
      }
      const balance = await contract.balanceOf(address)
      return balance.gt(0)
    },
  }
}
