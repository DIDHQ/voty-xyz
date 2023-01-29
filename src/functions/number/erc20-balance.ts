import { providers } from 'ethers'
import { formatUnits } from 'ethers/lib/utils.js'
import { uniq } from 'lodash-es'
import invariant from 'tiny-invariant'

import { Erc20__factory } from '../../../types/ethers-contracts'
import {
  chainIdToCoinType,
  chainIdToRpc,
  coinTypeToChainId,
} from '../../constants'
import { requiredCoinTypesOfDidResolver, resolveDid } from '../../did'
import { NumberFunction } from '../types'

export const erc20_balance: NumberFunction<[number, string]> = (
  evm_chain_id,
  token_contract_address,
) => {
  invariant(chainIdToCoinType[evm_chain_id])
  const rpc = chainIdToRpc[evm_chain_id]
  invariant(rpc)
  const provider = new providers.StaticJsonRpcProvider(rpc, 1)
  const contract = Erc20__factory.connect(token_contract_address, provider)

  return {
    requiredCoinTypes: uniq([
      ...requiredCoinTypesOfDidResolver,
      chainIdToCoinType[evm_chain_id],
    ]),
    execute: async (did, snapshots) => {
      const decimals = await contract.decimals()
      const { coinType, address } = await resolveDid(did, snapshots)
      if (coinTypeToChainId[coinType] === undefined) {
        return 0
      }
      const balance = await contract.balanceOf(address)
      return parseFloat(formatUnits(balance, decimals))
    },
  }
}
