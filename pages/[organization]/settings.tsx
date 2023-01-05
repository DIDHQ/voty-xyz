import Link from 'next/link'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { Breadcrumbs } from 'react-daisyui'
import DidSelect from '../../components/did-select'
import OrganizationForm from '../../components/organization-form'
import useArweaveFile from '../../hooks/use-arweave-file'
import useConnectedSignatureUnit from '../../hooks/use-connected-signature-unit'
import useDidConfig from '../../hooks/use-did-config'
import { Organization } from '../../src/schemas'

export default function OrganizationSettingsPage() {
  const router = useRouter()
  const { data: config } = useDidConfig(
    router.query.organization as string | undefined,
  )
  const { data: organization } = useArweaveFile<Organization>(
    config?.organization,
  )
  const connectedSignatureUnit = useConnectedSignatureUnit()
  const [did, setDid] = useState('')

  return organization ? (
    <>
      <Breadcrumbs>
        <Breadcrumbs.Item>
          <Link href="/">Home</Link>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>{organization.profile.name}</Breadcrumbs.Item>
      </Breadcrumbs>
      <OrganizationForm did={did} organization={organization} />
      Sign as DID:
      <DidSelect
        signatureUnit={connectedSignatureUnit}
        value={did}
        onChange={setDid}
      />
    </>
  ) : null
}
