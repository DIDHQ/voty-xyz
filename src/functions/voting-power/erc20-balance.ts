import { providers } from 'ethers'
import { formatUnits } from 'ethers/lib/utils.js'
import invariant from 'tiny-invariant'
import { Erc20__factory } from '../../../types/ethers-contracts'
import {
  chain_id_to_coin_type,
  chain_id_to_rpc,
  coin_type_to_chain_id,
} from '../../constants'
import { resolve_did } from '../did-resolvers'
import { VotingPowerFunction } from '../types'

export const erc20_balance: VotingPowerFunction<[number, string]> = (
  chain_id,
  token_contract,
) => {
  invariant(chain_id_to_coin_type[chain_id])
  const rpc = chain_id_to_rpc[chain_id]
  invariant(rpc)
  const provider = new providers.StaticJsonRpcProvider(rpc, 1)
  const contract = Erc20__factory.connect(token_contract, provider)

  return {
    coin_types: [chain_id_to_coin_type[chain_id]],
    execute: async (did, snapshot) => {
      const decimals = await contract.decimals()
      const { coin_type, address } = await resolve_did(did, snapshot)
      if (coin_type_to_chain_id[coin_type] === undefined) {
        return 0
      }
      const balance = await contract.balanceOf(address)
      return parseFloat(formatUnits(balance, decimals))
    },
  }
}
