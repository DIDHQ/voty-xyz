export const commonCoinTypes = {
  ETH: 60,
  TRX: 195,
  CKB: 309,
  MATIC: 966,
  BSC: 9006,
}

export const commonChainIds = {
  ETH: 1,
  BSC: 56,
  MATIC: 137,
}

export const chainIdToRpc: { [chainId: number]: string } = {
  [commonChainIds.ETH]: 'https://rpc.ankr.com/eth',
  [commonChainIds.BSC]: 'https://rpc.ankr.com/bsc',
  [commonChainIds.MATIC]: 'https://rpc.ankr.com/polygon',
}

export const chainIdToCoinType: { [chainId: number]: number } = {
  [commonChainIds.ETH]: commonCoinTypes.ETH,
  [commonChainIds.BSC]: commonCoinTypes.BSC,
  [commonChainIds.MATIC]: commonCoinTypes.MATIC,
}

export const coinTypeToChainId: { [coinType: number]: number } = {
  [commonCoinTypes.ETH]: commonChainIds.ETH,
  [commonCoinTypes.MATIC]: commonChainIds.MATIC,
  [commonCoinTypes.BSC]: commonChainIds.BSC,
}
