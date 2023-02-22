import { useQuery } from '@tanstack/react-query'
import pMap from 'p-map'

import useWallet from '../hooks/use-wallet'
import useDids from '../hooks/use-dids'
import { Workgroup } from '../utils/schemas/workgroup'
import { checkBoolean } from '../utils/functions/boolean'
import { Snapshots } from '../utils/types'
import Select from './basic/select'

export default function ProposerSelect(props: {
  workgroup?: Workgroup
  snapshots?: Snapshots
  value: string
  onChange(value: string): void
  className?: string
}) {
  const { account } = useWallet()
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
