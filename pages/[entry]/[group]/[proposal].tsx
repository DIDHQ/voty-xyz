import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import useSWR from 'swr'
import clsx from 'clsx'

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
import { checkChoice, powerOfChoice, updateChoice } from '../../../src/voting'

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
          className="mt-6 divide-y divide-gray-200 rounded-md border border-gray-200"
        >
          <Controller
            control={control}
            name="choice"
            render={({ field: { value, onChange } }) => (
              <>
                {proposal.options.map((option) => (
                  <Option
                    key={option}
                    type={proposal.voting_type}
                    option={option}
                    votingPower={votingPower}
                    counting={counting}
                    value={value}
                    onChange={onChange}
                  />
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

export function Option(props: {
  type: 'single' | 'multiple'
  option: string
  votingPower?: number
  counting?: {
    power: { [choice: string]: number }
    total: number
  }
  value: string
  onChange(value: string): void
}) {
  const { type, option, votingPower = 0, counting, value, onChange } = props
  const percentage = useMemo(() => {
    const power = powerOfChoice(type, value, votingPower)[option] || 0
    return (
      (((counting?.power[option] || 0) + power) /
        ((counting?.total || 0) + votingPower)) *
      100
    )
  }, [option, counting?.power, counting?.total, type, value, votingPower])

  return (
    <li
      className="flex items-center justify-between bg-no-repeat py-3 pl-2 pr-4 text-sm"
      style={{
        transition: 'background-size 0.3s ease-out',
        backgroundImage: `linear-gradient(90deg, #f3f4f6 100%, transparent 100%)`,
        backgroundSize: `${percentage}% auto`,
      }}
      onClick={() => {
        onChange(updateChoice(type, value, option))
      }}
    >
      <span className="ml-2 w-0 flex-1 truncate">{option}</span>
      <div className="ml-4 shrink-0 leading-none">
        <input
          type={type === 'single' ? 'radio' : 'checkbox'}
          checked={checkChoice(type, value, option)}
          onChange={() => null}
          className={clsx(
            type === 'single' ? undefined : 'rounded',
            'h-4 w-4 border border-gray-300 text-indigo-600 focus:ring-indigo-500',
          )}
        />
      </div>
    </li>
  )
}
