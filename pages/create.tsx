/* eslint-disable @next/next/no-img-element */

import { useEffect, useState } from 'react'

import FormItem from '../components/basic/form-item'
import DidSelect from '../components/did-select'
import OrganizationForm from '../components/organization-form'
import useDids from '../hooks/use-dids'
import useWallet from '../hooks/use-wallet'

export default function CreateOrganizationPage() {
  const { account } = useWallet()
  const { data: dids } = useDids(account)
  const [did, setDid] = useState('')
  useEffect(() => {
    setDid(dids?.[0] || '')
  }, [dids])

  return (
    <div className="p-8 space-y-8 divide-y divide-gray-200">
      <FormItem label="DID">
        <DidSelect account={account} value={did} onChange={setDid} />
      </FormItem>
      <OrganizationForm did={did} />
    </div>
  )
}
