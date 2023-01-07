import { HoldInterface } from '@icon-park/react'
import Link from 'next/link'
import { useMemo } from 'react'
import { Breadcrumbs, Menu } from 'react-daisyui'

import AvatarInput from '../../../../components/avatar-input'
import useRouterQuery from '../../../../hooks/use-router-query'
import useArweaveData from '../../../../hooks/use-arweave-data'
import useDidConfig from '../../../../hooks/use-did-config'
import { organizationWithSignatureSchema } from '../../../../src/schemas'
import useArweaveList from '../../../../hooks/use-arweave-list'
import { defaultArweaveTags } from '../../../../src/utils/arweave-tags'

export default function WorkgroupPage() {
  const [query] = useRouterQuery<['did', 'workgroup']>()
  const { data: config } = useDidConfig(query.did)
  const { data: organization } = useArweaveData(
    organizationWithSignatureSchema,
    config?.organization,
  )
  const workgroup = useMemo(
    () =>
      organization?.workgroups?.find(
        ({ profile }) => profile.name === query.workgroup,
      ),
    [organization?.workgroups, query.workgroup],
  )
  const { data: proposals } = useArweaveList({
    ...defaultArweaveTags,
    'app-index-type': 'proposal',
    'app-index-organization': query.did,
    'app-index-workgroup': workgroup?.id,
  })

  return (
    <>
      <Breadcrumbs>
        <Breadcrumbs.Item>
          <Link href="/">Home</Link>
        </Breadcrumbs.Item>
        {organization ? (
          <Breadcrumbs.Item>
            <Link href={`/${query.did}`}>{organization.profile.name}</Link>
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
            size={80}
            name={workgroup.profile.name}
            value={workgroup.profile.avatar}
            disabled
          />
          <h1>{workgroup.profile.name}</h1>
          <div className="menu bg-base-100 w-56 rounded-box">
            <Menu>
              <Menu.Item>
                <Link
                  href={`/${query.did}/workgroup/${query.workgroup}/create`}
                >
                  <HoldInterface />
                  New proposal
                </Link>
              </Menu.Item>
            </Menu>
          </div>
        </>
      ) : null}
      <ul>
        {proposals?.map((proposal) => (
          <li key={proposal}>
            <Link href={`/${query.did}/proposal/${proposal}`}>{proposal}</Link>
          </li>
        ))}
      </ul>
    </>
  )
}
