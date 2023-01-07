import { HoldInterface } from '@icon-park/react'
import Link from 'next/link'
import { useMemo } from 'react'
import { Breadcrumbs, Menu } from 'react-daisyui'
import AvatarInput from '../../../../components/avatar-input'
import useRouterQuery from '../../../../components/use-router-query'
import useArweaveFile from '../../../../hooks/use-arweave-file'
import useDidConfig from '../../../../hooks/use-did-config'
import { Organization } from '../../../../src/schemas'

export default function WorkgroupPage() {
  const [query] = useRouterQuery<['organization', 'workgroup']>()
  const { data: config } = useDidConfig(query.organization)
  const { data: organization } = useArweaveFile<Organization>(
    config?.organization,
  )
  const workgroup = useMemo(
    () =>
      organization?.workgroups?.find(
        ({ profile }) => profile.name === query.workgroup,
      ),
    [organization?.workgroups, query.workgroup],
  )

  return (
    <>
      <Breadcrumbs>
        <Breadcrumbs.Item>
          <Link href="/">Home</Link>
        </Breadcrumbs.Item>
        {organization ? (
          <Breadcrumbs.Item>
            <Link href={`/${query.organization}`}>
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
                  href={`/${query.organization}/workgroup/${query.workgroup}/create`}
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
