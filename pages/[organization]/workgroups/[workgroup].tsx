import { useRouter } from 'next/router'
import { useMemo } from 'react'
import AvatarInput from '../../../components/avatar-input'
import useArweaveFile from '../../../hooks/use-arweave-file'
import useDidConfig from '../../../hooks/use-did-config'
import { Organization } from '../../../src/schemas'

export default function WorkgroupPage() {
  const router = useRouter()
  const { data: config } = useDidConfig(
    router.query.organization as string | undefined,
  )
  const { data: organization } = useArweaveFile<Organization>(
    config?.organization,
  )
  const workgroup = useMemo(
    () =>
      organization?.workgroups?.find(
        ({ profile }) => profile.name === router.query.workgroup,
      ),
    [organization?.workgroups, router.query.workgroup],
  )

  return workgroup ? (
    <>
      <AvatarInput
        name={workgroup.profile.name}
        value={workgroup.profile.avatar}
        disabled
      />
      <h1>{workgroup.profile.name}</h1>
    </>
  ) : null
}
