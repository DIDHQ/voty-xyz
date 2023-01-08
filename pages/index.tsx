import Link from 'next/link'

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
        <button>Create an Organization</button>
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
