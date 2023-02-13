import { useEffect } from 'react'
import useSWR from 'swr'
import pMap from 'p-map'

import useWallet from '../hooks/use-wallet'
import useDids from '../hooks/use-dids'
import { Group } from '../src/schemas'
import { checkBoolean } from '../src/functions/boolean'
import { DID, Snapshots } from '../src/types'
import Select from './basic/select'

export default function ProposerSelect(props: {
  group?: Group
  snapshots?: Snapshots
  value: string
  onChange(value: string): void
  className?: string
}) {
  const { onChange } = props
  const { account, did } = useWallet()
  const { data: dids } = useDids(account)
  const { data } = useSWR(
    dids && props.group && props.snapshots
      ? [dids, props.group, props.snapshots]
      : null,
    async () => {
      const booleans = await pMap(
        dids!,
        (did) =>
          checkBoolean(
            props.group!.permission.proposing,
            did as DID,
            props.snapshots!,
          ),
        { concurrency: 5 },
      )
      return dids!.filter((_, index) => booleans[index])
    },
    { revalidateOnFocus: false },
  )
  useEffect(() => {
    onChange(data?.find((d) => d === did) || data?.[0] || '')
  }, [did, data, onChange])

  return (
    <Select
      top
      options={dids}
      value={props.value}
      onChange={props.onChange}
      className={props.className}
    />
  )
}
