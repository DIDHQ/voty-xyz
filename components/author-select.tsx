import { useEffect } from 'react'

import useDids from '../hooks/use-dids'
import useWallet from '../hooks/use-wallet'
import Select from './basic/select'

export default function AuthorSelect(props: {
  value: string
  onChange(value: string): void
  top?: boolean
  className?: string
}) {
  const { account } = useWallet()
  const { data: dids } = useDids(account)
  const { onChange } = props
  useEffect(() => {
    if (dids?.[0]) {
      onChange(dids[0])
    }
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
