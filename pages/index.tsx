import Link from 'next/link'

import Button from '../components/basic/button'
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
        <Button primary>Create an Organization</Button>
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
