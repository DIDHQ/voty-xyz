import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import pMap from 'p-map'
import { useAtomValue } from 'jotai'

import useWallet from '../hooks/use-wallet'
import useDids from '../hooks/use-dids'
import { Workgroup } from '../utils/schemas/workgroup'
import { checkBoolean } from '../utils/functions/boolean'
import { Snapshots } from '../utils/types'
import Select from './basic/select'
import { currentDidAtom } from '../utils/atoms'

export default function ProposerSelect(props: {
  workgroup?: Workgroup
  snapshots?: Snapshots
  value: string
  onChange(value: string): void
  className?: string
}) {
  const { onChange } = props
  const { account } = useWallet()
  const currentDid = useAtomValue(currentDidAtom)
  const { data: dids } = useDids(account, props.snapshots)
  const { data: disables } = useQuery(
    [dids, props.workgroup, props.snapshots],
    async () => {
      const booleans = await pMap(
        dids!,
        (did) =>
          checkBoolean(
            props.workgroup!.permission.proposing,
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
      enabled: !!dids && !!props.workgroup && !!props.snapshots,
      refetchOnWindowFocus: false,
    },
  )
  useEffect(() => {
    onChange(
      dids?.find((d) => !disables?.[d] && d === currentDid) ||
        dids?.find((d) => !disables?.[d]) ||
        '',
    )
  }, [currentDid, dids, disables, onChange])

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
