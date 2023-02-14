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
  const { data: disables } = useSWR(
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
      return dids!.reduce((obj, did, index) => {
        obj[did] = !booleans[index]
        return obj
      }, {} as { [key: string]: boolean })
    },
    { revalidateOnFocus: false },
  )
  useEffect(() => {
    onChange(
      dids?.find((d) => !disables?.[d] && d === did) ||
        dids?.find((d) => !disables?.[d]) ||
        '',
    )
  }, [did, dids, disables, onChange])

  return (
    <Select
      top
      options={dids}
      disables={disables}
      value={props.value}
      onChange={props.onChange}
      className={props.className}
    />
  )
}
