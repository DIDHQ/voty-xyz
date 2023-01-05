import Link from 'next/link'
import { useRouter } from 'next/router'
import { Breadcrumbs } from 'react-daisyui'
import OrganizationForm from '../../components/organization-form'
import useArweaveFile from '../../hooks/use-arweave-file'
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

  return organization ? (
    <>
      <Breadcrumbs>
        <Breadcrumbs.Item>
          <Link href="/">Home</Link>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>{organization.profile.name}</Breadcrumbs.Item>
      </Breadcrumbs>
      <OrganizationForm
        did={router.query.organization as string}
        organization={organization}
      />
    </>
  ) : null
}
