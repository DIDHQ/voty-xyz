import { createInstance } from 'dotbit'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import useArweaveFile from '../../hooks/use-arweave-file'

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
  const { data } = useArweaveFile(hash)

  return <>{String(data)}</>
}
