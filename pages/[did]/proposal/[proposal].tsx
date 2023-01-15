import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import useSWR from 'swr'

import DidSelect from '../../../components/did-select'
import { useList } from '../../../hooks/use-api'
import useArweaveData from '../../../hooks/use-arweave-data'
import useArweaveUpload from '../../../hooks/use-arweave-upload'
import useAsync from '../../../hooks/use-async'
import useRouterQuery from '../../../hooks/use-router-query'
import useSignJson from '../../../hooks/use-sign-json'
import useWallet from '../../../hooks/use-wallet'
import { DataType } from '../../../src/constants'
import { calculateVotingPower } from '../../../src/functions/voting-power'
import {
  organizationWithSignatureSchema,
  proposalWithSignatureSchema,
  Vote,
  voteSchema,
  VoteWithSignature,
} from '../../../src/schemas'
import { mapSnapshots } from '../../../src/snapshot'
import { DID } from '../../../src/types'
import Button from '../../../components/basic/button'

export default function ProposalPage() {
  const [query] = useRouterQuery<['proposal']>()
  const { data: proposal } = useArweaveData(
    proposalWithSignatureSchema,
    query.proposal,
  )
  const { data: organization } = useArweaveData(
    organizationWithSignatureSchema,
    proposal?.organization,
  )
  const workgroup = useMemo(
    () =>
      organization?.workgroups?.find(({ id }) => id === proposal?.workgroup),
    [organization?.workgroups, proposal?.workgroup],
  )
  const [did, setDid] = useState('')
  const { account } = useWallet()
  const {
    setValue,
    resetField,
    control,
    handleSubmit: onSubmit,
  } = useForm<Vote>({
    resolver: zodResolver(voteSchema),
  })
  const handleSignJson = useSignJson(did)
  const handleArweaveUpload = useArweaveUpload()
  const handleSubmit = useAsync(
    useCallback(
      async (json: Vote) => {
        const signed = await handleSignJson(json)
        if (!signed) {
          throw new Error('signature failed')
        }
        await handleArweaveUpload(signed)
      },
      [handleArweaveUpload, handleSignJson],
    ),
  )
  useEffect(() => {
    if (proposal && query.proposal) {
      setValue('did', proposal.did)
      setValue('organization', proposal.organization)
      setValue('workgroup', proposal.workgroup)
      setValue('proposal', query.proposal)
    }
  }, [proposal, query.proposal, setValue])
  const { data: votes } = useList<VoteWithSignature>(DataType.VOTE, [
    ['proposal', query.proposal],
  ])
  const { data: votingPower } = useSWR(
    workgroup && did && proposal
      ? ['votingPower', workgroup, did, proposal]
      : null,
    () =>
      calculateVotingPower(
        workgroup!.voting_power,
        did! as DID,
        mapSnapshots(proposal!.snapshots),
      ),
  )
  useEffect(() => {
    if (votingPower === undefined) {
      resetField('power')
    } else {
      setValue('power', votingPower)
    }
  }, [resetField, setValue, votingPower])

  return query.proposal && proposal ? (
    <div className="p-8">
      <div className="overflow-hidden bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {proposal.title}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{proposal.did}</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900">{proposal.type}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Author</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {proposal.signature.did}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Start Time</dt>
              <dd className="mt-1 text-sm text-gray-900">-</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">End Time</dt>
              <dd className="mt-1 text-sm text-gray-900">-</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">About</dt>
              <dd className="mt-1 text-sm text-gray-900">{proposal.body}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Choices</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <ul
                  role="list"
                  className="divide-y divide-gray-200 rounded-md border border-gray-200"
                >
                  <Controller
                    control={control}
                    name="choice"
                    render={({ field: { value, onChange } }) => (
                      <>
                        {proposal.choices.map((choice, index) => (
                          <li
                            key={choice + index}
                            className="flex items-center justify-between py-3 pl-2 pr-4 text-sm"
                            onClick={() => {
                              onChange(index)
                            }}
                          >
                            <span className="ml-2 w-0 flex-1 truncate">
                              {choice}
                            </span>
                            <div className="ml-4 flex-shrink-0">
                              <input
                                type="radio"
                                checked={index === value}
                                className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                            </div>
                          </li>
                        ))}
                      </>
                    )}
                  />
                </ul>
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <div className="pt-5">
        <div className="flex justify-end">
          <DidSelect
            account={account}
            value={did}
            onChange={setDid}
            className="w-48 mr-4"
          />
          <Button
            primary
            onClick={onSubmit(handleSubmit.execute)}
            loading={handleSubmit.status === 'pending'}
          >
            Vote {votingPower}
          </Button>
        </div>
      </div>
    </div>
  ) : null
}
