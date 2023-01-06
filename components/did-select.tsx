import { Select } from 'react-daisyui'

import useDids from '../hooks/use-dids'
import { Account } from '../src/types'

export default function DidSelect(props: {
  account?: Account
  value: string
  onChange(value: string): void
}) {
  const { data: dids } = useDids(props.account)

  return (
    <Select
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
    >
      <Select.Option />
      <>
        {dids?.map((did) => (
          <Select.Option key={did} value={did}>
            {did}
          </Select.Option>
        ))}
      </>
    </Select>
  )
}
