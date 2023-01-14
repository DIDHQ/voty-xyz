/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react'

import Alert from '../components/basic/alert'
import FormItem from '../components/basic/form-item'
import DidSelect from '../components/did-select'
import OrganizationForm from '../components/organization-form'
import useDidConfig from '../hooks/use-did-config'
import useDids from '../hooks/use-dids'
import useWallet from '../hooks/use-wallet'

export default function CreateOrganizationPage() {
  const { account } = useWallet()
  const { data: dids } = useDids(account)
  const [did, setDid] = useState('')
  useEffect(() => {
    setDid(dids?.[0] || '')
  }, [dids])
  const { data: config } = useDidConfig(did)

  return (
    <div className="p-8 space-y-8 divide-y divide-gray-200">
      <div>
        <FormItem
          label="DID"
          description="select one DID as your organization entry"
        >
          <DidSelect account={account} value={did} onChange={setDid} />
        </FormItem>
        {config?.organization ? (
          <Alert
            type="info"
            text={`${did} already bounded to an organization`}
            action={{ text: 'View', href: `/${did}` }}
            className="mt-6"
          />
        ) : null}
      </div>
      {config?.organization ? null : <OrganizationForm did={did} />}
    </div>
  )
}
