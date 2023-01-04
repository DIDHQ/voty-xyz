import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button, Menu } from 'react-daisyui'
import {
  Earth,
  Twitter,
  RobotOne,
  GithubOne,
  ViewList,
  HoldInterface,
  UserToUserTransmission,
  Info,
  SettingOne,
} from '@icon-park/react'
import AvatarInput from '../../components/avatar-input'
import useArweaveFile from '../../hooks/use-arweave-file'
import useBitRecordValue from '../../hooks/use-bit-record-value'
import { Organization } from '../../src/schemas'

export default function OrganizationIndexPage() {
  const router = useRouter()
  const organization = router.query.organization as string | undefined
  const { data: hash } = useBitRecordValue(organization, 'voty')
  const { data } = useArweaveFile<Organization>(hash)

  return (
    <>
      <AvatarInput
        name={data?.profile.name}
        value={data?.profile.avatar}
        disabled
      />
      <h1>{data?.profile.name}</h1>
      <div className="menu bg-base-100 w-56 rounded-box">
        <Menu>
          <Menu.Item>
            <Link href={`/${organization}`} className="active">
              <ViewList />
              Proposals
            </Link>
          </Menu.Item>
          <Menu.Item>
            <Link href={`/${organization}/create`}>
              <HoldInterface />
              New proposal
            </Link>
          </Menu.Item>
          <Menu.Item>
            <Link href={`/delegate/${organization}`}>
              <UserToUserTransmission />
              Delegate
            </Link>
          </Menu.Item>
          <Menu.Item>
            <Link href={`/${organization}/about`}>
              <Info />
              About
            </Link>
          </Menu.Item>
          <Menu.Item>
            <Link href={`/${organization}/settings`}>
              <SettingOne />
              Settings
            </Link>
          </Menu.Item>
        </Menu>
      </div>
      <div>
        {data?.profile.website ? (
          <Button shape="circle">
            <a href={data.profile.website}>
              <Earth />
            </a>
          </Button>
        ) : null}
        {data?.communities?.map((community, index) => (
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
  )
}
