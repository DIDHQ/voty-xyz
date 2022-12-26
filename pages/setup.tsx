import { Button, ButtonGroup } from '@blueprintjs/core'
import { createInstance } from 'dotbit'
import useSWR from 'swr'
import useWallet from '../hooks/use-wallet'

const dotbit = createInstance()

export default function SetupPage() {
  const wallet = useWallet()
  const { data: accounts } = useSWR(
    wallet.address ? ['accounts', wallet.address, wallet.coinType] : null,
    () => {
      return dotbit.accountsOfOwner({
        key: wallet.address,
        coin_type: wallet.coinType,
      })
    },
  )

  return (
    <ButtonGroup vertical>
      {accounts?.map((account) => (
        <Button key={account.account}>{account.account}</Button>
      ))}
    </ButtonGroup>
  )
}
