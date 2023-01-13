import Link from 'next/link'

import PrimaryButton from '../components/basic/primary-button'
import { useList } from '../hooks/use-api'
import { DataType } from '../src/constants'
import { OrganizationWithSignature } from '../src/schemas'

export default function IndexPage() {
  const { data: organizations } = useList<OrganizationWithSignature>(
    DataType.ORGANIZATION,
  )

  return (
    <>
      <Link href="/create">
        <PrimaryButton>Create an Organization</PrimaryButton>
      </Link>
      <ul>
        {organizations?.map((organization) => (
          <li key={organization.did}>
            <Link href={`/${organization.did}`}>
              {organization.profile.name}
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
