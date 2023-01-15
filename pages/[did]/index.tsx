import Link from 'next/link'
import { useMemo } from 'react'

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
import Tabs from '../../components/basic/tabs'

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
  const tabs = useMemo(
    () => [
      { name: 'All Proposals', href: `/${query.did}`, current: true },
      ...(organization?.workgroups?.map((workgroup) => ({
        name: workgroup.profile.name,
        href: `/${query.did}/workgroup/${workgroup.id}`,
        current: false,
      })) || []),
    ],
    [organization?.workgroups, query.did],
  )

  return organization ? (
    <div className="p-8">
      <div className="md:flex md:items-center md:justify-between md:space-x-5">
        <div className="flex items-start space-x-5">
          <div className="flex-shrink-0">
            <div className="relative">
              <Avatar
                size={16}
                name={organization.did}
                value={organization.profile.avatar}
              />
              <span
                className="absolute inset-0 rounded-full shadow-inner"
                aria-hidden="true"
              />
            </div>
          </div>
          {/*
        Use vertical padding to simulate center alignment when both lines of text are one line,
        but preserve the same layout if the text wraps without making the image jump around.
      */}
          <div className="pt-1.5">
            <h1 className="text-2xl font-bold text-gray-900">
              {organization.profile.name}
            </h1>
            <p className="text-sm font-medium text-gray-500">
              {organization.profile.about}
            </p>
          </div>
        </div>
        <div className="justify-stretch mt-6 flex flex-col-reverse space-y-4 space-y-reverse sm:flex-row-reverse sm:justify-end sm:space-y-0 sm:space-x-3 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
          <Link href={`/${organization.did}/settings`}>
            <Button>Settings</Button>
          </Link>
        </div>
      </div>
      <Tabs tabs={tabs} className="mt-8" />
    </div>
  ) : null
}
