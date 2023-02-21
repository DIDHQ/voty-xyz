import { isTestnet } from '../../constants'
import { fetchJson, postJson } from '../../fetcher'

export async function getAccountList(coinType: number, address: string) {
  const json = await fetchJson<{
    errno: number
    errmsg: string
    data: { account_list: { account: string }[] }
  }>(
    isTestnet
      ? 'https://test-indexer.did.id/v1/account/list'
      : 'https://indexer-v1.did.id/v1/account/list',
    postJson({
      type: 'blockchain',
      key_info: {
        coin_type: coinType.toString(),
        chain_id: '',
        key: address,
      },
      role: 'manager',
    }),
  )
  return json.data.account_list.map(({ account }) => account)
}
