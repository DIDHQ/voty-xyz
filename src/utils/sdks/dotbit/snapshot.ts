import { isTestnet } from '../../constants'
import { fetchJson, postJson } from '../../fetcher'

const endpoint = isTestnet
  ? 'https://test-snapshot-api.did.id'
  : 'https://snapshot-api.did.id'

export async function snapshotPermissionsInfo(
  did: string,
  snapshot: string,
): Promise<string | undefined> {
  const { data } = await fetchJson<{
    errno: number
    errmsg: string
    data?: {
      account: string
      account_id: string
      block_number: number
      owner: string
      owner_algorithm_id: number
      manager: string
      manager_algorithm_id: number
    }
  }>(
    `${endpoint}/v1/snapshot/permissions/info`,
    postJson({ account: did, block_number: parseInt(snapshot) }),
  )
  return data?.manager
}

export async function snapshotAddressAccounts(
  coinType: number,
  address: string,
  snapshot: string,
): Promise<string[]> {
  const result: string[] = []
  let page = 1
  while (true) {
    const { data } = await fetchJson<{
      errno: number
      errmsg: string
      data: { total: number; accounts: { account: string }[] }
    }>(
      `${endpoint}/v1/snapshot/address/accounts`,
      postJson({
        type: 'blockchain',
        key_info: {
          coin_type: coinType.toString(),
          chain_id: '',
          key: address,
        },
        block_number: parseInt(snapshot),
        role_type: 'manager',
        page,
      }),
    )
    if (data.accounts.length === 0) {
      break
    }
    page++
    result.push(...data.accounts.map(({ account }) => account))
  }
  return result
}
