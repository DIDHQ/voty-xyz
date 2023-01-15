import useDids from '../hooks/use-dids'
import { Account } from '../src/types'
import Select from './basic/select'

export default function DidSelect(props: {
  account?: Account
  value: string
  onChange(value: string): void
  className?: string
}) {
  const { data: dids } = useDids(props.account)

  return (
    <Select
      options={dids}
      value={props.value}
      onChange={props.onChange}
      className={props.className}
    />
  )
}
