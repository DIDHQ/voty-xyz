import { fetchJson, postJson } from '../../fetcher'

export async function hasEnabledSecondLevel(did: string) {
  const { err_no } = await fetchJson<{
    err_no: number
  }>(`/api/v1/custom/script/info`, postJson({ account: did }))
  return err_no === 0
}
