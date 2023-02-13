import { useEffect } from 'react'
import useSWR from 'swr'
import pMap from 'p-map'

import useWallet from '../hooks/use-wallet'
import useDids from '../hooks/use-dids'
import { Group } from '../src/schemas'
import { DID, Snapshots } from '../src/types'
import Select from './basic/select'
import { calculateNumber } from '../src/functions/number'

export default function VoterSelect(props: {
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
      const numbers = await pMap(
        dids!,
        (did) =>
          calculateNumber(
            props.group!.permission.voting,
            did as DID,
            props.snapshots!,
          ),
        { concurrency: 5 },
      )
      return dids!.filter((_, index) => numbers[index])
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
