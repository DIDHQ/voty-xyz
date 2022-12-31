import { providers } from 'ethers'
import { formatUnits } from 'ethers/lib/utils.js'
import invariant from 'tiny-invariant'
import { Erc20__factory } from '../../../types/ethers-contracts'
import { chain_id_to_rpc, coin_type_to_chain_id } from '../../constants'
import { resolve_did } from '../did-resolvers'
import { VotingPowerFunction } from '../types'

export const erc20_balance: VotingPowerFunction<[number, string]> = async (
  chain_id,
  token_contract,
) => {
  const rpc = chain_id_to_rpc[chain_id]
  invariant(rpc)
  const provider = new providers.StaticJsonRpcProvider(rpc, 1)
  const contract = Erc20__factory.connect(token_contract, provider)
  const decimals = await contract.decimals()

  return async (did, snapshot) => {
    const { coin_type, address } = await resolve_did(did, snapshot)
    invariant(coin_type_to_chain_id[coin_type])
    const balance = await contract.balanceOf(address)
    return parseFloat(formatUnits(balance, decimals))
  }
}
