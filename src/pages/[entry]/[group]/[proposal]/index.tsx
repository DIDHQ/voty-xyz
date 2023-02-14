import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import useSWR from 'swr'
import clsx from 'clsx'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { startCase } from 'lodash-es'
import { BoltIcon } from '@heroicons/react/20/solid'

import { useGroup } from '../../../../hooks/use-api'
import useRouterQuery from '../../../../hooks/use-router-query'
import { calculateNumber } from '../../../../utils/functions/number'
import { Vote, voteSchema } from '../../../../utils/schemas'
import { mapSnapshots } from '../../../../utils/snapshot'
import { DID } from '../../../../utils/types'
import useStatus from '../../../../hooks/use-status'
import {
  checkChoice,
  choiceIsEmpty,
  powerOfChoice,
  stringifyChoice,
  updateChoice,
} from '../../../../utils/voting'
import TextButton from '../../../../components/basic/text-button'
import Markdown from '../../../../components/basic/markdown'
import { DetailItem, DetailList } from '../../../../components/basic/detail'
import Status from '../../../../components/status'
import { permalink2Url } from '../../../../utils/arweave'
import { trpc } from '../../../../utils/trpc'
import { inferRouterOutputs } from '@trpc/server'
import { ChoiceRouter } from '../../../../server/routers/choice'

const VoterSelect = dynamic(
  () => import('../../../../components/voter-select'),
  { ssr: false },
)

const SigningButton = dynamic(
  () => import('../../../../components/signing-button'),
  { ssr: false },
)

export default function ProposalPage() {
  const query = useRouterQuery<['proposal']>()
  const { data: proposal } = trpc.proposal.getByPermalink.useQuery(
    { permalink: query.proposal },
    { enabled: !!query.proposal },
  )
  const { data: community } = trpc.community.getByPermalink.useQuery(
    { permalink: proposal?.community },
    { enabled: !!proposal?.community },
  )
  const group = useGroup(community, proposal?.group)
  const { data: status } = useStatus(query.proposal)
  const { data: choices, refetch: refetchChoices } =
    trpc.choice.groupByProposal.useQuery(query, { enabled: !!query.proposal })
  const [did, setDid] = useState('')
  const methods = useForm<Vote>({
    resolver: zodResolver(voteSchema),
  })
  const { setValue, resetField, control, watch } = methods
  useEffect(() => {
    if (query.proposal) {
      setValue('proposal', query.proposal)
    }
  }, [query.proposal, setValue])
  const { data: list, refetch: refetchList } = trpc.vote.list.useInfiniteQuery(
    query,
    { enabled: !!query.proposal },
  )
  const votes = useMemo(() => list?.pages.flatMap(({ data }) => data), [list])
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
  const handleSuccess = useCallback(() => {
    refetchList()
    refetchChoices()
    setValue('choice', '')
  }, [refetchList, refetchChoices, setValue])
  const disabled = !did

  return community && proposal && group ? (
    <div className="mt-6 flex items-start">
      <div className="mr-6 flex-1">
        <div className="mb-6 border-b border-gray-200 pb-6">
          <Link href={`/${community.author.did}/${proposal.group}`}>
            <TextButton>
              <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
            </TextButton>
          </Link>
          <h3 className="mt-2 text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
            {proposal.title}
          </h3>
          <article className="prose mt-8">
            <Markdown>{proposal.extension?.body}</Markdown>
          </article>
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
                    choices={choices}
                    disabled={disabled}
                    value={value}
                    onChange={onChange}
                  />
                ))}
              </>
            )}
          />
        </ul>
        <div className="flex justify-end py-6">
          <div className="flex rounded-md">
            <VoterSelect
              proposal={query.proposal}
              group={group}
              snapshots={mapSnapshots(proposal.snapshots)}
              value={did}
              onChange={setDid}
              className="rounded-r-none active:z-10"
            />
            <FormProvider {...methods}>
              <SigningButton
                did={did}
                icon={BoltIcon}
                onSuccess={handleSuccess}
                disabled={
                  choiceIsEmpty(proposal.voting_type, watch('choice')) ||
                  !status?.timestamp ||
                  !votingPower ||
                  isValidating
                }
                className="rounded-l-none border-l-0 active:z-10"
              >
                {votingPower}
              </SigningButton>
            </FormProvider>
          </div>
        </div>
        {votes?.length ? (
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  DID
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Choice
                </th>
                <th
                  scope="col"
                  className="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900 sm:pr-6"
                >
                  Power
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {votes.map((vote) => (
                <tr key={vote.permalink}>
                  <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                    {vote.author.did}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {stringifyChoice(proposal.voting_type, vote.choice)}
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <a
                      href={permalink2Url(vote.permalink)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {vote.power}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
      <div className="sticky top-24 w-80 shrink-0">
        <div className="-mt-2 space-y-6 rounded-md border border-gray-200 p-6">
          <DetailList
            title="Information"
            right={<Status permalink={query.proposal} />}
          >
            <DetailItem title="Community">{community.name}</DetailItem>
            <DetailItem title="Group">{group.name}</DetailItem>
            <DetailItem title="Proposer">{proposal.author.did}</DetailItem>
            <DetailItem title="Voting type">
              {startCase(proposal.voting_type)}
            </DetailItem>
          </DetailList>
          <DetailList title="Schedule">
            <DetailItem title="Start">
              {status?.timestamp
                ? new Date(
                    (status.timestamp + group.duration.announcement) * 1000,
                  ).toLocaleString([], { hour12: false })
                : '-'}
            </DetailItem>
            <DetailItem title="End">
              {status?.timestamp
                ? new Date(
                    (status.timestamp +
                      group.duration.announcement +
                      (group.duration.adding_option || 0) +
                      group.duration.voting) *
                      1000,
                  ).toLocaleString([], { hour12: false })
                : '-'}
            </DetailItem>
          </DetailList>
          <DetailList title="Terms and conditions">
            <article className="prose-sm pt-2 prose-pre:overflow-x-auto prose-ol:list-decimal marker:prose-ol:text-gray-400 prose-ul:list-disc marker:prose-ul:text-gray-400">
              <Markdown>{group?.extension.terms_and_conditions}</Markdown>
            </article>
          </DetailList>
        </div>
      </div>
    </div>
  ) : null
}

export function Option(props: {
  type: 'single' | 'multiple'
  option: string
  votingPower?: number
  choices?: inferRouterOutputs<ChoiceRouter>['groupByProposal']
  disabled?: boolean
  value: string
  onChange(value: string): void
}) {
  const { type, option, votingPower = 0, choices, value, onChange } = props
  const percentage = useMemo(() => {
    const power = powerOfChoice(type, value, votingPower)[option] || 0
    const denominator =
      (choices?.total || 0) + (choiceIsEmpty(type, value) ? 0 : votingPower)
    if (denominator === 0) {
      return 0
    }
    return (((choices?.powers[option] || 0) + power) / denominator) * 100
  }, [option, choices?.powers, choices?.total, type, value, votingPower])

  return (
    <li
      className="flex items-center justify-between bg-no-repeat py-3 pl-2 pr-4 text-sm"
      style={{
        transition: 'background-size 0.3s ease-out',
        backgroundImage: `linear-gradient(90deg, #f3f4f6 100%, transparent 100%)`,
        backgroundSize: `${percentage}% 100%`,
      }}
      onClick={() => {
        if (!props.disabled) {
          onChange(updateChoice(type, value, option))
        }
      }}
    >
      <span className="ml-2 w-0 flex-1 truncate">{option}</span>
      <div className="ml-4 shrink-0 leading-none">
        <input
          type={type === 'single' ? 'radio' : 'checkbox'}
          checked={checkChoice(type, value, option)}
          disabled={props.disabled}
          onChange={() => null}
          className={clsx(
            type === 'single' ? undefined : 'rounded',
            'h-4 w-4 border border-gray-300',
            'text-indigo-600 focus:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-50',
          )}
        />
      </div>
    </li>
  )
}
