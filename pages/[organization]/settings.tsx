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
          did={router.query.organization as string}
          organization={organization}
        />
      </div>
    </div>
  ) : null
}
