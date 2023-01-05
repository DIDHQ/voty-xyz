import Link from 'next/link'
import { Breadcrumbs } from 'react-daisyui'

import OrganizationForm from '../../components/organization-form'
import useRouterQuery from '../../components/use-router-query'
import useArweaveData from '../../hooks/use-arweave-data'
import useDidConfig from '../../hooks/use-did-config'
import { organizationWithSignatureSchema } from '../../src/schemas'

export default function OrganizationSettingsPage() {
  const [query] = useRouterQuery<['organization']>()
  const { data: config } = useDidConfig(query.organization)
  const { data: organization } = useArweaveData(
    organizationWithSignatureSchema,
    config?.organization,
  )

  return organization && query.organization ? (
    <>
      <Breadcrumbs>
        <Breadcrumbs.Item>
          <Link href="/">Home</Link>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>{organization.profile.name}</Breadcrumbs.Item>
      </Breadcrumbs>
      <OrganizationForm did={query.organization} organization={organization} />
    </>
  ) : null
}
