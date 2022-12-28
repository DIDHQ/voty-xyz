import { Code, Pre } from '@blueprintjs/core'
import { createInstance } from 'dotbit'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import useArweaveFile from '../../hooks/use-arweave-file'
import { Organization } from '../../src/schemas'

const dotbit = createInstance()

export default function OrganizationSettingsPage() {
  const router = useRouter()
  const organization = router.query.organization as string | undefined
  const { data: hash } = useSWR(
    organization ? ['organization', organization] : null,
    async () => {
      const records = await dotbit.records(organization!, 'dweb.arweave')
      return records.find((record) => record.label === 'voty')?.value
    },
  )
  const { data } = useArweaveFile<Organization>(hash)

  return (
    <Pre wrap="">
      <Code>{JSON.stringify(data, null, 2)}</Code>
    </Pre>
  )
}
