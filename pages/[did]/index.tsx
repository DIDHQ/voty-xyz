import Link from 'next/link'
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

import Avatar from '../../components/basic/avatar'
import useArweaveData from '../../hooks/use-arweave-data'
import useDidConfig from '../../hooks/use-did-config'
import {
  organizationWithSignatureSchema,
  ProposalWithSignature,
} from '../../src/schemas'
import useRouterQuery from '../../hooks/use-router-query'
import { useList } from '../../hooks/use-api'
import { DataType } from '../../src/constants'
import ArweaveLink from '../../components/arweave-link'

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
      <Avatar
        size={24}
        name={organization.profile.name}
        value={organization.profile.avatar}
      />
      {config?.organization ? <ArweaveLink id={config.organization} /> : null}
      <h1>{organization.profile.name}</h1>
      <div className="menu bg-base-100 w-56 rounded-box">
        <ul>
          <li>
            <Link href={`/${query.did}`} className="active">
              <NetworkTree />
              Workgroups
            </Link>
          </li>
          {organization.workgroups?.map((workgroup) => (
            <li key={workgroup.id} className="ml-6">
              <Link href={`/${query.did}/workgroup/${workgroup.profile.name}`}>
                {workgroup.profile.name}
              </Link>
            </li>
          ))}
          <li>
            <Link href={`/delegate/${query.did}`}>
              <UserToUserTransmission />
              Delegate
            </Link>
          </li>
          <li>
            <Link href={`/${query.did}/about`}>
              <Info />
              About
            </Link>
          </li>
          <li>
            <Link href={`/${query.did}/settings`}>
              <SettingOne />
              Settings
            </Link>
          </li>
        </ul>
      </div>
      <div>
        {organization.profile.website ? (
          <button>
            <a href={organization.profile.website}>
              <Earth />
            </a>
          </button>
        ) : null}
        {organization.social?.twitter ? (
          <button>
            <a href={`https://twitter.com/${organization.social.twitter}`}>
              <Twitter />
            </a>
          </button>
        ) : null}
        {organization.social?.discord ? (
          <button>
            <a href={`https://discord.gg/${organization.social.discord}`}>
              <RobotOne />
            </a>
          </button>
        ) : null}
        {organization.social?.github ? (
          <button>
            <a href={`https://github.com/${organization.social.github}`}>
              <GithubOne />
            </a>
          </button>
        ) : null}
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
