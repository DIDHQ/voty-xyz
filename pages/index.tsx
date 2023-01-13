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
        <button className="inline-flex items-center rounded border border-transparent bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          Create an Organization
        </button>
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
