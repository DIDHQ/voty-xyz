import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { uniq, without } from 'lodash-es'
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
  Authorized,
  communityWithAuthorSchema,
  proposalWithAuthorSchema,
  Vote,
  voteSchema,
} from '../../../src/schemas'
import { mapSnapshots } from '../../../src/snapshot'
import { DID } from '../../../src/types'
import Button from '../../../components/basic/button'

export default function ProposalPage() {
  const [query] = useRouterQuery<['proposal']>()
  const { data: proposal } = useArweaveData(
    proposalWithAuthorSchema,
    query.proposal,
  )
  const { data: community } = useArweaveData(
    communityWithAuthorSchema,
    proposal?.community,
  )
  const group = useMemo(
    () =>
      community?.groups?.find(
        ({ extension: { id } }) => id === proposal?.group,
      ),
    [community?.groups, proposal?.group],
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
    if (query.proposal) {
      setValue('proposal', query.proposal)
    }
  }, [query.proposal, setValue])
  const { data: votes } = useList<Authorized<Vote>>(DataType.VOTE, [
    ['proposal', query.proposal],
  ])
  const { data: votingPower, isValidating } = useSWR(
    group && did && proposal ? ['votingPower', group, did, proposal] : null,
    () =>
      calculateVotingPower(
        group!.voting_power,
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
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {proposal.author.did}
          </p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {proposal.voting_type}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Author</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {proposal.author.did}
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
            {proposal.extension?.body ? (
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Body</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {proposal.extension.body}
                </dd>
              </div>
            ) : null}
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Options</dt>
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
                        {proposal.options.map((choice) => (
                          <li
                            key={choice}
                            className="flex items-center justify-between py-3 pl-2 pr-4 text-sm"
                            onClick={() => {
                              if (proposal.voting_type === 'single') {
                                onChange(JSON.stringify(choice))
                              } else {
                                const old = JSON.parse(value) as string[]
                                onChange(
                                  JSON.stringify(
                                    old.includes(choice)
                                      ? without(old, choice)
                                      : uniq([...old, choice]),
                                  ),
                                )
                              }
                            }}
                          >
                            <span className="ml-2 w-0 flex-1 truncate">
                              {choice}
                            </span>
                            <div className="ml-4 flex-shrink-0">
                              {proposal.voting_type === 'single' ? (
                                <input
                                  type="radio"
                                  checked={choice === value}
                                  onClick={() => null}
                                  className="h-4 w-4 border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={(
                                    JSON.parse(choice) as string[]
                                  ).includes(choice)}
                                  onClick={() => null}
                                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                              )}
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
      <div className="py-5">
        <div className="flex justify-end">
          <DidSelect
            account={account}
            value={did}
            onChange={setDid}
            className="w-48 mr-4"
          />
          <Button
            primary
            onClick={onSubmit(handleSubmit.execute, console.error)}
            disabled={!votingPower || isValidating}
            loading={handleSubmit.status === 'pending'}
          >
            Vote {votingPower}
          </Button>
        </div>
      </div>
      <ul
        role="list"
        className="divide-y divide-gray-200 rounded-md border border-gray-200"
      >
        {votes?.map((vote) => (
          <li
            key={vote.id}
            className="flex items-center justify-between py-3 pl-2 pr-4 text-sm"
          >
            <span className="ml-2 w-0 flex-1 truncate">{vote.author.did}</span>
            {vote.choice}
          </li>
        ))}
      </ul>
    </div>
  ) : null
}
