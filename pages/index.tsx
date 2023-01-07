import Link from 'next/link'
import { Button } from 'react-daisyui'

import Footer from '../components/footer'
import { useList } from '../hooks/use-api'
import { DataType } from '../src/constants'
import { Organization } from '../src/schemas'

export default function IndexPage() {
  const { data: organizations } = useList<Organization>(DataType.ORGANIZATION)

  return (
    <>
      <Link href="/create">
        <Button color="primary">Create an Organization</Button>
      </Link>
      <ul>
        {organizations?.map((organization) => (
          <li key={organization.did}>
            <Link href={`/${organization.did}`}>{organization.did}</Link>
          </li>
        ))}
      </ul>
      <Footer />
    </>
  )
}
