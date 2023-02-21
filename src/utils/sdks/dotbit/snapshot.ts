import { fetchJson, postJson } from '../../fetcher'

export async function snapshotPermissionsInfo(
  did: string,
  snapshot: string,
): Promise<string> {
  const { data } = await fetchJson<{
    errno: number
    errmsg: string
    data: {
      account: string
      account_id: string
      block_number: number
      owner: string
      owner_algorithm_id: number
      manager: string
      manager_algorithm_id: number
    }
  }>(
    `https://test-snapshot-api.did.id/v1/snapshot/permissions/info`,
    postJson({ account: did, block_number: parseInt(snapshot) }),
  )
  return data.manager
}

export async function snapshotAddressAccounts(
  coinType: number,
  address: string,
  snapshot: string,
): Promise<string[]> {
  const { data } = await fetchJson<{
    errno: number
    errmsg: string
    data: { accounts: { account: string }[] }
  }>(
    'https://test-snapshot-api.did.id/v1/snapshot/address/accounts',
    postJson({
      type: 'blockchain',
      key_info: {
        coin_type: coinType.toString(),
        chain_id: '',
        key: address,
      },
      block_number: parseInt(snapshot),
      role_type: 'manager',
    }),
  )
  return data.accounts.map(({ account }) => account)
}
