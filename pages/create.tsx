import { useEffect, useState } from 'react'

import Alert from '../components/basic/alert'
import FormItem from '../components/basic/form-item'
import DidSelect from '../components/did-select'
import useDidConfig from '../hooks/use-did-config'
import useDids from '../hooks/use-dids'
import useWallet from '../hooks/use-wallet'

export default function CreateCommunityPage() {
  const { account } = useWallet()
  const { data: dids } = useDids(account)
  const [did, setDid] = useState('')
  useEffect(() => {
    setDid(dids?.[0] || '')
  }, [dids])
  const { data: config } = useDidConfig(did)

  return (
    <div className="p-8">
      <FormItem label="DID" description="select an DID as your community entry">
        <DidSelect account={account} value={did} onChange={setDid} />
      </FormItem>
      {dids?.length === 0 ? (
        <Alert
          type="info"
          text="Do not have a DID? Register now!"
          action={{ text: 'Register', href: 'https://app.did.id/explorer' }}
          className="mt-6"
        />
      ) : config?.community ? (
        <Alert
          type="warning"
          text={`${did} already bounded to an community`}
          action={{ text: 'View', href: `/${did}` }}
          className="mt-6"
        />
      ) : (
        <Alert
          type="success"
          text={`${did} is able to create an community`}
          action={{ text: 'Create', href: `/${did}/settings` }}
          className="mt-6"
        />
      )}
    </div>
  )
}
