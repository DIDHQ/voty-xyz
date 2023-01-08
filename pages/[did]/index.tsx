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
import {
  organizationWithSignatureSchema,
  ProposalWithSignature,
} from '../../src/schemas'
import useRouterQuery from '../../hooks/use-router-query'
import { useList } from '../../hooks/use-api'
import { DataType } from '../../src/constants'

export default function OrganizationIndexPage() {
  const [query] = useRouterQuery<['did']>()
  const { data: config } = useDidConfig(query.did)
  const { data: organization } = useArweaveData(
    organizationWithSignatureSchema,
    config?.organization,
  )
  const { data: proposals } = useList<ProposalWithSignature>(
    DataType.PROPOSAL,
    [['did', query.did]],
  )

  return organization ? (
    <>
      <Breadcrumbs>
        <Breadcrumbs.Item>
          <Link href="/">Home</Link>
        </Breadcrumbs.Item>
        <Breadcrumbs.Item>{organization.profile.name}</Breadcrumbs.Item>
      </Breadcrumbs>
      <AvatarInput
        size={80}
        name={organization.profile.name}
        value={organization.profile.avatar}
        disabled
      />
      <h1>{organization.profile.name}</h1>
      <div className="menu bg-base-100 w-56 rounded-box">
        <Menu>
          <Menu.Item>
            <Link href={`/${query.did}`} className="active">
              <NetworkTree />
              Workgroups
            </Link>
          </Menu.Item>
          {organization.workgroups?.map((workgroup) => (
            <Menu.Item key={workgroup.id} className="ml-6">
              <Link href={`/${query.did}/workgroup/${workgroup.profile.name}`}>
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
            <Link href={`/delegate/${query.did}`}>
              <UserToUserTransmission />
              Delegate
            </Link>
          </Menu.Item>
          <Menu.Item>
            <Link href={`/${query.did}/about`}>
              <Info />
              About
            </Link>
          </Menu.Item>
          <Menu.Item>
            <Link href={`/${query.did}/settings`}>
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
      <ul>
        {proposals?.map((proposal) => (
          <li key={proposal.id}>
            <Link href={`/${query.did}/proposal/${proposal.id}`}>
              {proposal.title}
            </Link>
          </li>
        ))}
      </ul>
    </>
  ) : null
}
