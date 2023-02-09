import { useEffect } from 'react'
import useDids from '../hooks/use-dids'
import { Account } from '../src/types'
import Select from './basic/select'

export default function DidSelect(props: {
  account?: Account
  value: string
  onChange(value: string): void
  top?: boolean
  className?: string
}) {
  const { data: dids } = useDids(props.account)
  const { onChange } = props
  useEffect(() => {
    if (dids?.[0]) onChange(dids[0])
  }, [dids, onChange])

  return (
    <Select
      options={dids}
      value={props.value}
      onChange={props.onChange}
      top={props.top}
      className={props.className}
    />
  )
}
