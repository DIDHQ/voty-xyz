import { Button, DialogStep, MultistepDialog } from '@blueprintjs/core'
import { createInstance } from 'dotbit'
import { useState } from 'react'
import useSWR from 'swr'
import useWallet from '../hooks/use-wallet'

const dotbit = createInstance()

export default function SetupOrganizationDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [bit, setBit] = useState('')

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Setup Organization</Button>
      <MultistepDialog
        title="Setup Organization"
        icon="settings"
        isOpen={isOpen}
        onClosed={() => setIsOpen(false)}
      >
        <DialogStep
          id="select"
          title="Select .bit"
          panel={<SelectBitPanel value={bit} onChange={setBit} />}
        />
      </MultistepDialog>
    </>
  )
}

function SelectBitPanel(props: {
  value: string
  onChange(value: string): void
}) {
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
    <div>
      {accounts?.map((account) => (
        <Button
          key={account.account}
          onClick={() => props.onChange(account.account)}
        >
          {account.account}
        </Button>
      ))}
    </div>
  )
}
