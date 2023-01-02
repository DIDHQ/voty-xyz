export const common_coin_types = {
  ETH: 60,
  TRX: 195,
  CKB: 309,
  MATIC: 966,
  BSC: 9006,
}

export const common_chain_ids = {
  ETH: 1,
  BSC: 56,
  MATIC: 137,
}

export const chain_id_to_rpc: { [chain_id: number]: string } = {
  [common_chain_ids.ETH]: 'https://rpc.ankr.com/eth',
  [common_chain_ids.BSC]: 'https://rpc.ankr.com/bsc',
  [common_chain_ids.MATIC]: 'https://rpc.ankr.com/polygon',
}

export const chain_id_to_coin_type: { [chain_id: number]: number } = {
  [common_chain_ids.ETH]: common_coin_types.ETH,
  [common_chain_ids.BSC]: common_coin_types.BSC,
  [common_chain_ids.MATIC]: common_coin_types.MATIC,
}

export const coin_type_to_chain_id: { [coin_type: number]: number } = {
  [common_coin_types.ETH]: common_chain_ids.ETH,
  [common_coin_types.MATIC]: common_chain_ids.MATIC,
  [common_coin_types.BSC]: common_chain_ids.BSC,
}
