export const isTestnet = !!process.env.NEXT_PUBLIC_TESTNET

export const documentTitle = 'VOTY'

export const commonCoinTypes = {
  ETH: 60,
  TRX: 195,
  CKB: 309,
  AR: 472,
  MATIC: 966,
  BSC: 9006,
}

export const commonChainIds = {
  ETH: 1,
  ETH_GOERLI: 5,
  BSC: 56,
  BSC_CHAPEL: 97,
  POLYGON: 137,
  POLYGON_MUMBAI: 80001,
}

export const chainIdToRpc: { [chainId: number]: string } = {
  [commonChainIds.ETH]: 'https://rpc.ankr.com/eth',
  [commonChainIds.ETH_GOERLI]: 'https://rpc.ankr.com/eth_goerli',
  [commonChainIds.BSC]: 'https://rpc.ankr.com/bsc',
  [commonChainIds.BSC_CHAPEL]: 'https://rpc.ankr.com/bsc_testnet_chapel',
  [commonChainIds.POLYGON]: 'https://rpc.ankr.com/polygon',
  [commonChainIds.POLYGON_MUMBAI]: 'https://rpc.ankr.com/polygon_mumbai',
}

export const chainIdToCoinType: { [chainId: number]: number } = {
  [isTestnet ? commonChainIds.ETH_GOERLI : commonChainIds.ETH]:
    commonCoinTypes.ETH,
  [isTestnet ? commonChainIds.BSC_CHAPEL : commonChainIds.BSC]:
    commonCoinTypes.BSC,
  [isTestnet ? commonChainIds.POLYGON_MUMBAI : commonChainIds.POLYGON]:
    commonCoinTypes.MATIC,
}

export const coinTypeToChainId: { [coinType: number]: number } = {
  [commonCoinTypes.ETH]: isTestnet
    ? commonChainIds.ETH_GOERLI
    : commonChainIds.ETH,
  [commonCoinTypes.MATIC]: isTestnet
    ? commonChainIds.POLYGON_MUMBAI
    : commonChainIds.POLYGON,
  [commonCoinTypes.BSC]: isTestnet
    ? commonChainIds.BSC_CHAPEL
    : commonChainIds.BSC,
}

export const coinTypeNames: { [coinType: number]: string } = {
  [commonCoinTypes.ETH]: 'eth',
  [commonCoinTypes.TRX]: 'trx',
  [commonCoinTypes.CKB]: 'ckb',
  [commonCoinTypes.MATIC]: 'matic',
  [commonCoinTypes.BSC]: 'bnb',
}

export enum DataType {
  COMMUNITY = 'community',
  PROPOSAL = 'proposal',
  VOTE = 'vote',
}
