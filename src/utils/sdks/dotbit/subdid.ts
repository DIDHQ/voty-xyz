import { isTestnet } from '../../constants'
import { fetchJson, postJson } from '../../fetcher'

export async function hasEnabledSubDID(did: string) {
  const { err_no } = await fetchJson<{
    err_no: number
  }>(
    `https://${
      isTestnet ? 'test-' : ''
    }subaccount-api.did.id/v1/custom/script/info`,
    postJson({ account: did }),
  )
  return err_no === 0
}
