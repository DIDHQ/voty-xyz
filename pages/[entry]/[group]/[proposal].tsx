import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { uniq, without } from 'lodash-es'
import useSWR from 'swr'

import DidSelect from '../../../components/did-select'
import {
  useImport,
  useListVotes,
  useRetrieve,
  useUpload,
} from '../../../hooks/use-api'
import useAsync from '../../../hooks/use-async'
import useRouterQuery from '../../../hooks/use-router-query'
import useSignJson from '../../../hooks/use-sign-json'
import useWallet from '../../../hooks/use-wallet'
import { calculateNumber } from '../../../src/functions/number'
import { Vote, voteSchema } from '../../../src/schemas'
import { mapSnapshots } from '../../../src/snapshot'
import { DID } from '../../../src/types'
import Button from '../../../components/basic/button'
import { DataType } from '../../../src/constants'
import useArweaveData from '../../../hooks/use-arweave-data'
import Alert from '../../../components/basic/alert'
import useStatus from '../../../hooks/use-status'

export default function ProposalPage() {
  const [query] = useRouterQuery<['proposal']>()
  const { data } = useArweaveData(DataType.PROPOSAL, query.proposal)
  const { data: status } = useStatus(query.proposal)
  const handleImport = useAsync(useImport(query.proposal))
  const { data: proposal } = useRetrieve(DataType.PROPOSAL, query.proposal)
  const { data: community } = useRetrieve(
    DataType.COMMUNITY,
    proposal?.community,
  )
  const group = useMemo(
    () => (proposal ? community?.groups?.[proposal?.group] : undefined),
    [community?.groups, proposal],
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
  const handleUpload = useUpload()
  const handleSubmit = useAsync(
    useCallback(
      async (json: Vote) => {
        const signed = await handleSignJson(json)
        if (!signed) {
          throw new Error('signature failed')
        }
        await handleUpload(signed)
      },
      [handleUpload, handleSignJson],
    ),
  )
  useEffect(() => {
    if (query.proposal) {
      setValue('proposal', query.proposal)
    }
  }, [query.proposal, setValue])
  const { data: list } = useListVotes(query.proposal)
  const votes = useMemo(() => list?.flatMap(({ data }) => data), [list])
  const { data: votingPower, isValidating } = useSWR(
    group && did && proposal ? ['votingPower', group, did, proposal] : null,
    () =>
      calculateNumber(
        group!.permission.voting,
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

  return query.proposal && proposal && group ? (
    <div className="py-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            {proposal.title}
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            {proposal.author.did}
          </p>
        </div>
        <div className="border-t px-4 py-5 sm:px-6">
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
              <dt className="text-sm font-medium text-gray-500">Start time</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {status?.timestamp
                  ? new Date(
                      (status.timestamp + group.period.announcement) * 1000,
                    ).toLocaleString([], { hour12: false })
                  : '-'}
              </dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">End time</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {status?.timestamp
                  ? new Date(
                      (status.timestamp +
                        group.period.announcement +
                        (group.period.adding_option || 0) +
                        group.period.voting) *
                        1000,
                    ).toLocaleString([], { hour12: false })
                  : '-'}
              </dd>
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
                                const old = JSON.parse(
                                  value || '[]',
                                ) as string[]
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
                            <div className="ml-4 shrink-0 leading-none">
                              {proposal.voting_type === 'single' ? (
                                <input
                                  type="radio"
                                  checked={JSON.stringify(choice) === value}
                                  onChange={() => null}
                                  className="h-4 w-4 border border-gray-200 text-indigo-600 focus:ring-indigo-500"
                                />
                              ) : (
                                <input
                                  type="checkbox"
                                  checked={(
                                    JSON.parse(value || '[]') as string[]
                                  ).includes(choice)}
                                  onChange={() => null}
                                  className="h-4 w-4 rounded border border-gray-200 text-indigo-600 focus:ring-indigo-500"
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
            top
            className="mr-4 w-48"
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
            key={vote.uri}
            className="flex items-center justify-between py-3 pl-2 pr-4 text-sm"
          >
            <span className="ml-2 truncate">{vote.author.did}</span>
            <span>{vote.choice}</span>
            <span>{vote.power}</span>
          </li>
        ))}
      </ul>
    </div>
  ) : data ? (
    <Alert
      type="info"
      action="Import"
      onClick={handleImport.execute}
      className="mt-4"
    >
      This proposal exists on the blockchain, but not imported into Voty.
    </Alert>
  ) : null
}
