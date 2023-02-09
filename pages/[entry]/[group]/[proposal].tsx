import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { uniq, without } from 'lodash-es'
import useSWR from 'swr'

import DidSelect from '../../../components/did-select'
import {
  useCounting,
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
import useStatus from '../../../hooks/use-status'
import Card from '../../../components/basic/card'
import { Grid6, GridItem6 } from '../../../components/basic/grid'

export default function ProposalPage() {
  const [query] = useRouterQuery<['proposal']>()
  const { data: status } = useStatus(query.proposal)
  const { data: proposal } = useRetrieve(DataType.PROPOSAL, query.proposal)
  const { data: community } = useRetrieve(
    DataType.COMMUNITY,
    proposal?.community,
  )
  const { data: counting, mutate: mutateCounting } = useCounting(query.proposal)
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
  const { data: list, mutate: mutateList } = useListVotes(query.proposal)
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
  useEffect(() => {
    if (handleSubmit.status === 'success') {
      mutateList()
      mutateCounting()
    }
  }, [handleSubmit.status, mutateList, mutateCounting])

  return proposal && group ? (
    <div className="flex py-8">
      <div className="mr-6 flex-[2_2_0%]">
        <div>
          <h2 className="font-semibold leading-6 text-indigo-600">Proposal</h2>
          <h3 className="mt-2 text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
            {proposal.title}
          </h3>
          <p className="mt-8 text-lg text-gray-500">
            {proposal.extension?.body}
          </p>
        </div>
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
                        const old = JSON.parse(value || '[]') as string[]
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
                    <span className="ml-2 w-0 flex-1 truncate">{choice}</span>
                    <span>{counting?.[choice]?.power}</span>
                    <div className="ml-4 shrink-0 leading-none">
                      {proposal.voting_type === 'single' ? (
                        <input
                          type="radio"
                          checked={JSON.stringify(choice) === value}
                          onChange={() => null}
                          className="h-4 w-4 border border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      ) : (
                        <input
                          type="checkbox"
                          checked={(
                            JSON.parse(value || '[]') as string[]
                          ).includes(choice)}
                          onChange={() => null}
                          className="h-4 w-4 rounded border border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      )}
                    </div>
                  </li>
                ))}
              </>
            )}
          />
        </ul>
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
        {votes?.length ? (
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
        ) : null}
      </div>
      <Card title="Information" className="flex-1">
        <Grid6>
          <GridItem6>
            <dt className="text-sm font-medium text-gray-500">Type</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {proposal.voting_type}
            </dd>
          </GridItem6>
          <GridItem6>
            <dt className="text-sm font-medium text-gray-500">Author</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {proposal.author.did}
            </dd>
          </GridItem6>
          <GridItem6>
            <dt className="text-sm font-medium text-gray-500">Start time</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {status?.timestamp
                ? new Date(
                    (status.timestamp + group.period.announcement) * 1000,
                  ).toLocaleString([], { hour12: false })
                : '-'}
            </dd>
          </GridItem6>
          <GridItem6>
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
          </GridItem6>
        </Grid6>
      </Card>
    </div>
  ) : null
}
