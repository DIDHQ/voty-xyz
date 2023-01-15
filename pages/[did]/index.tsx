import Link from 'next/link'

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
import Button from '../../components/basic/button'
import { DiscordIcon, GitHubIcon, TwitterIcon } from '../../components/icons'

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
    <main className="flex flex-1 overflow-hidden">
      <aside className="hidden lg:order-first lg:block lg:flex-shrink-0">
        <div className="relative flex h-full w-96 flex-col overflow-y-auto border-r border-gray-200 bg-white">
          <div className="m-8 mb-0 flex items-start">
            <Avatar
              size={16}
              name={organization.did}
              value={organization.profile.avatar}
            />
            <div className="ml-4">
              <h3 className="text-xl font-bold text-gray-900 sm:text-2xl">
                {organization.profile.name}
              </h3>
              <p className="text-sm text-gray-500">
                {organization.profile.about}
              </p>
            </div>
          </div>
          <div className="flex space-x-4 mx-8 my-4">
            {organization.social?.twitter ? (
              <a
                href={`https://twitter.com/${organization.social.twitter}`}
                className="text-gray-400 hover:text-gray-500"
              >
                <TwitterIcon className="w-6 h-6" />
              </a>
            ) : null}
            {organization.social?.discord ? (
              <a
                href={`https://discord.com/invite/${organization.social.discord}`}
                className="text-gray-400 hover:text-gray-500"
              >
                <DiscordIcon className="w-6 h-6" />
              </a>
            ) : null}
            {organization.social?.github ? (
              <a
                href={`https://github.com/${organization.social.github}`}
                className="text-gray-400 hover:text-gray-500"
              >
                <GitHubIcon className="w-6 h-6" />
              </a>
            ) : null}
          </div>
          <div className="flex space-x-4 mx-8">
            <Link href={`/${organization.did}/settings`}>
              <Button>Settings</Button>
            </Link>
          </div>
        </div>
      </aside>
      <section
        aria-labelledby="primary-heading"
        className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto lg:order-last"
      >
        <h1 id="primary-heading" className="sr-only">
          Account
        </h1>
        {null}
      </section>
    </main>
  ) : null
}
