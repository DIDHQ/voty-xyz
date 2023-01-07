import Link from 'next/link'
import { Breadcrumbs } from 'react-daisyui'

import OrganizationForm from '../../components/organization-form'
import useRouterQuery from '../../hooks/use-router-query'
import useArweaveData from '../../hooks/use-arweave-data'
import useDidConfig from '../../hooks/use-did-config'
import { organizationWithSignatureSchema } from '../../src/schemas'

export default function OrganizationSettingsPage() {
  const [query] = useRouterQuery<['did']>()
  const { data: config } = useDidConfig(query.did)
  const { data: organization } = useArweaveData(
    organizationWithSignatureSchema,
    config?.organization,
  )

  return organization && query.did ? (
    <div className="flex justify-center mt-5">
      <div className="flex flex-col w-full md:w-[48rem] px-10">
        <Breadcrumbs>
          <Breadcrumbs.Item>
            <Link href="/">Home</Link>
          </Breadcrumbs.Item>
          <Breadcrumbs.Item>
            <Link href={`/ph0ng.bit`}>{organization.profile.name}</Link>
          </Breadcrumbs.Item>
          <Breadcrumbs.Item>Settings</Breadcrumbs.Item>
        </Breadcrumbs>
        <h1 className="text-3xl font-bold mb-8 mt-8">Settings</h1>
        <OrganizationForm did={query.did} organization={organization} />
      </div>
    </div>
  ) : null
}
