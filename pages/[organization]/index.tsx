import Link from 'next/link'
import { Breadcrumbs, Button, Menu } from 'react-daisyui'
import {
  Earth,
  Twitter,
  RobotOne,
  GithubOne,
  UserToUserTransmission,
  Info,
  SettingOne,
  NetworkTree,
} from '@icon-park/react'

import AvatarInput from '../../components/avatar-input'
import useArweaveData from '../../hooks/use-arweave-data'
import useDidConfig from '../../hooks/use-did-config'
import { organizationWithSignatureSchema } from '../../src/schemas'
import useRouterQuery from '../../components/use-router-query'
import useArweaveList from '../../hooks/use-arweave-list'
import { getArweaveTags } from '../../src/utils/arweave-tags'

export default function OrganizationIndexPage() {
  const [query] = useRouterQuery<['organization', 'workgroup']>()
  const { data: config } = useDidConfig(query.organization)
  const { data: organization } = useArweaveData(
    organizationWithSignatureSchema,
    config?.organization,
  )
  const { data: list } = useArweaveList(
    organization ? getArweaveTags(organization) : undefined,
  )
  console.log(list)

  return organization ? (
    <>
      <Breadcrumbs>
        <Breadcrumbs.Item>
          <Link href="/">Home</Link>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>{organization.profile.name}</Breadcrumbs.Item>
      </Breadcrumbs>
      <AvatarInput
        name={organization.profile.name}
        value={organization.profile.avatar}
        disabled
      />
      <h1>{organization.profile.name}</h1>
      <div className="menu bg-base-100 w-56 rounded-box">
        <Menu>
          <Menu.Item>
            <Link
              href={`/${query.organization}`}
              className={query.workgroup ? undefined : 'active'}
            >
              <NetworkTree />
              Workgroups
            </Link>
          </Menu.Item>
          {organization.workgroups?.map((workgroup) => (
            <Menu.Item key={workgroup.id} className="ml-6">
              <Link
                href={`/${query.organization}/workgroup/${workgroup.profile.name}`}
              >
                <AvatarInput
                  size={24}
                  name={workgroup.profile.name}
                  value={workgroup.profile.avatar}
                  disabled
                />
                {workgroup.profile.name}
              </Link>
            </Menu.Item>
          ))}
          <Menu.Item>
            <Link href={`/delegate/${query.organization}`}>
              <UserToUserTransmission />
              Delegate
            </Link>
          </Menu.Item>
          <Menu.Item>
            <Link href={`/${query.organization}/about`}>
              <Info />
              About
            </Link>
          </Menu.Item>
          <Menu.Item>
            <Link href={`/${query.organization}/settings`}>
              <SettingOne />
              Settings
            </Link>
          </Menu.Item>
        </Menu>
      </div>
      <div>
        {organization.profile.website ? (
          <Button shape="circle">
            <a href={organization.profile.website}>
              <Earth />
            </a>
          </Button>
        ) : null}
        {organization.communities?.map((community, index) => (
          <Button key={index} shape="circle">
            <a
              href={`${
                {
                  twitter: 'https://twitter.com',
                  discord: 'https://discord.gg',
                  github: 'https://github.com',
                }[community.type]
              }/${community.value}`}
            >
              {
                {
                  twitter: <Twitter />,
                  discord: <RobotOne />,
                  github: <GithubOne />,
                }[community.type]
              }
            </a>
          </Button>
        ))}
      </div>
    </>
  ) : null
}
