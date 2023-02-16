import { fetchJson } from './fetcher'

export async function snapshotPermissionsInfo(
  did: string,
  snapshot: number,
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
  }>(`https://test-snapshot-api.did.id/v1/snapshot/permissions/info`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      account: did,
      block_number: snapshot,
    }),
  })
  return data.owner
}

export async function snapshotAddressAccounts(
  coinType: number,
  address: string,
  snapshot: number,
): Promise<string[]> {
  const { data } = await fetchJson<{
    errno: number
    errmsg: string
    data: { accounts: { account: string }[] }
  }>('', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      type: 'blockchain',
      key_info: {
        coin_type: coinType.toString(),
        chain_id: '',
        key: address,
      },
      block_number: snapshot,
      role_type: 'manager',
    }),
  })
  return data.accounts.map(({ account }) => account)
}
