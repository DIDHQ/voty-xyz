import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import Alert from '../components/basic/alert'
import FormItem from '../components/basic/form-item'
import DidSelect from '../components/did-select'
import { useEntryConfig } from '../hooks/use-api'
import useDids from '../hooks/use-dids'
import useWallet from '../hooks/use-wallet'

export default function CreateCommunityPage() {
  const router = useRouter()
  const { account } = useWallet()
  const { data: dids } = useDids(account)
  const [entry, setEntry] = useState('')
  useEffect(() => {
    setEntry(dids?.[0] || '')
  }, [dids])
  const { data: config } = useEntryConfig(entry)

  return (
    <div className="py-8">
      <FormItem label="DID" description="select an DID as your community entry">
        <DidSelect account={account} value={entry} onChange={setEntry} />
      </FormItem>
      {dids?.length === 0 ? (
        <Alert
          type="info"
          action="Register"
          onClick={() => {
            window.location.href = 'https://app.did.id/explorer'
          }}
          className="mt-6"
        >
          Do not have a DID? Register now!
        </Alert>
      ) : config?.community ? (
        <Alert
          type="warning"
          action="View"
          onClick={() => {
            router.push(`/${entry}`)
          }}
          className="mt-6"
        >
          {entry} already bounded to an community
        </Alert>
      ) : (
        <Alert
          type="success"
          action="Create"
          onClick={() => {
            router.push(`/${entry}/settings`)
          }}
          className="mt-6"
        >
          {entry} is able to create an community
        </Alert>
      )}
    </div>
  )
}
