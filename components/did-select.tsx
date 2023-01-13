import useDids from '../hooks/use-dids'
import { Account } from '../src/types'

export default function DidSelect(props: {
  account?: Account
  value: string
  onChange(value: string): void
}) {
  const { data: dids } = useDids(props.account)

  return (
    <select
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
    >
      <option />
      {dids?.map((did) => (
        <option key={did} value={did}>
          {did}
        </option>
      ))}
    </select>
  )
}
