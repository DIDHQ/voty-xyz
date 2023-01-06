import Link from 'next/link'
import { Breadcrumbs } from 'react-daisyui'

import OrganizationForm from '../../components/organization-form'
import useRouterQuery from '../../components/use-router-query'
import useArweaveFile from '../../hooks/use-arweave-file'
import useDidConfig from '../../hooks/use-did-config'
import { Organization } from '../../src/schemas'

export default function OrganizationSettingsPage() {
  const [query] = useRouterQuery<['organization']>()
  const { data: config } = useDidConfig(query.organization)
  const { data: organization } = useArweaveFile<Organization>(
    config?.organization,
  )

  return organization && query.organization ? (
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
        <OrganizationForm
          did={query.organization}
          organization={organization}
        />
      </div>
    </div>
  ) : null
}
