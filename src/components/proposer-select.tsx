import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import pMap from 'p-map'

import useWallet from '../hooks/use-wallet'
import useDids from '../hooks/use-dids'
import { Group } from '../utils/schemas/group'
import { checkBoolean } from '../utils/functions/boolean'
import { Snapshots } from '../utils/types'
import Select from './basic/select'

export default function ProposerSelect(props: {
  group?: Group
  snapshots?: Snapshots
  value: string
  onChange(value: string): void
  className?: string
}) {
  const { onChange } = props
  const { account, name } = useWallet()
  const { data: dids } = useDids(account, props.snapshots)
  const { data: disables } = useQuery(
    [dids, props.group, props.snapshots],
    async () => {
      const booleans = await pMap(
        dids!,
        (did) =>
          checkBoolean(
            props.group!.permission.proposing,
            did,
            props.snapshots!,
          ),
        { concurrency: 5 },
      )
      return dids!.reduce((obj, did, index) => {
        obj[did] = !booleans[index]
        return obj
      }, {} as { [key: string]: boolean })
    },
    {
      enabled: !!dids && !!props.group && !!props.snapshots,
      refetchOnWindowFocus: false,
    },
  )
  useEffect(() => {
    onChange(
      dids?.find((d) => !disables?.[d] && d === name) ||
        dids?.find((d) => !disables?.[d]) ||
        '',
    )
  }, [name, dids, disables, onChange])

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
