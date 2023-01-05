import { HoldInterface } from '@icon-park/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useMemo } from 'react'
import { Breadcrumbs, Menu } from 'react-daisyui'
import AvatarInput from '../../../../components/avatar-input'
import useArweaveFile from '../../../../hooks/use-arweave-file'
import useDidConfig from '../../../../hooks/use-did-config'
import { Organization } from '../../../../src/schemas'

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

  return (
    <>
      <Breadcrumbs>
        <Breadcrumbs.Item>
          <Link href="/">Home</Link>
        </Breadcrumbs.Item>
        {organization ? (
          <Breadcrumbs.Item>
            <Link href={`/${router.query.organization}`}>
              {organization.profile.name}
            </Link>
          </Breadcrumbs.Item>
        ) : (
          <></>
        )}
        {workgroup ? (
          <Breadcrumbs.Item>{workgroup.profile.name}</Breadcrumbs.Item>
        ) : (
          <></>
        )}
      </Breadcrumbs>
      {workgroup ? (
        <>
          <AvatarInput
            name={workgroup.profile.name}
            value={workgroup.profile.avatar}
            disabled
          />
          <h1>{workgroup.profile.name}</h1>
          <div className="menu bg-base-100 w-56 rounded-box">
            <Menu>
              <Menu.Item>
                <Link
                  href={`/${router.query.organization}/workgroup/${router.query.workgroup}/create`}
                >
                  <HoldInterface />
                  New proposal
                </Link>
              </Menu.Item>
            </Menu>
          </div>
        </>
      ) : null}
    </>
  )
}
