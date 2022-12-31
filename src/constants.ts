export const chain_id_to_rpc: { [chain_id: number]: string } = {
  1: 'https://rpc.ankr.com/eth',
  56: 'https://rpc.ankr.com/bsc',
  137: 'https://rpc.ankr.com/polygon',
}

export const coin_type_to_chain_id: { [coin_type: number]: number } = {
  60: 1,
  966: 137,
  9006: 56,
}
