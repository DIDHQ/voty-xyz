import { useAccount } from 'wagmi'
import useSWR from 'swr'
import { createInstance } from 'dotbit'

const dotbit = createInstance()

export default function DidSelect(props: {
  value: string
  onChange(value: string): void
}) {
  const account = useAccount()
  const { data: accounts } = useSWR(
    account.address ? ['account', account] : null,
    async () => {
      const accounts = await dotbit.accountsOfOwner({ key: account.address! })
      return accounts.map(({ account }) => account)
    },
    { revalidateOnFocus: false },
  )

  return (
    <select
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
    >
      <option />
      {accounts?.map((account) => (
        <option key={account} value={account}>
          {account}
        </option>
      ))}
    </select>
  )
}
