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
import { VotingPowerFunction } from '../types'

export const erc20_balance: VotingPowerFunction<[number, string]> = (
  chainId,
  tokenContract,
) => {
  invariant(chainIdToCoinType[chainId])
  const rpc = chainIdToRpc[chainId]
  invariant(rpc)
  const provider = new providers.StaticJsonRpcProvider(rpc, 1)
  const contract = Erc20__factory.connect(tokenContract, provider)

  return {
    requiredCoinTypes: uniq([
      ...requiredCoinTypesOfDidResolver,
      chainIdToCoinType[chainId],
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
