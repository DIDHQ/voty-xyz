import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import clsx from 'clsx'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { startCase } from 'lodash-es'
import { BoltIcon } from '@heroicons/react/20/solid'
import type { inferRouterOutputs } from '@trpc/server'

import useWorkgroup from '../../../../hooks/use-workgroup'
import useRouterQuery from '../../../../hooks/use-router-query'
import { calculateNumber } from '../../../../utils/functions/number'
import { Vote, voteSchema } from '../../../../utils/schemas/vote'
import {
  checkChoice,
  choiceIsEmpty,
  powerOfChoice,
  stringifyChoice,
  updateChoice,
} from '../../../../utils/voting'
import TextButton from '../../../../components/basic/text-button'
import { DetailItem, DetailList } from '../../../../components/basic/detail'
import { permalink2Url } from '../../../../utils/permalink'
import { trpc } from '../../../../utils/trpc'
import { ChoiceRouter } from '../../../../server/routers/choice'
import Article from '../../../../components/basic/article'

const StatusIcon = dynamic(() => import('../../../../components/status-icon'), {
  ssr: false,
})

const ProposalSchedule = dynamic(
  () => import('../../../../components/proposal-schedule'),
  { ssr: false },
)

const VoterSelect = dynamic(
  () => import('../../../../components/voter-select'),
  { ssr: false },
)

const SigningVoteButton = dynamic(
  () => import('../../../../components/signing/signing-vote-button'),
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
  const workgroup = useWorkgroup(community, proposal?.workgroup)
  const { data: choices, refetch: refetchChoices } =
    trpc.choice.groupByProposal.useQuery(
      { proposal: query.proposal },
      { enabled: !!query.proposal },
    )
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
  const { data: votingPower, isFetching } = useQuery(
    ['votingPower', workgroup, did, proposal],
    () =>
      calculateNumber(workgroup!.permission.voting, did!, proposal!.snapshots),
    { enabled: !!workgroup && !!did && !!proposal },
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
    setDid('')
  }, [refetchList, refetchChoices, setValue])
  const disabled = !did

  return community && proposal && workgroup ? (
    <div className="flex w-full flex-1 flex-col items-start pt-6 sm:flex-row">
      <div className="w-full flex-1 sm:mr-6">
        <div className="mb-6 border-b border-gray-200 pb-6">
          <Link href={`/${community.authorship.author}/${proposal.workgroup}`}>
            <TextButton>
              <h2 className="text-[1rem] font-semibold leading-6">← Back</h2>
            </TextButton>
          </Link>
          <h3 className="mt-2 text-3xl font-bold leading-8 tracking-tight text-gray-900 sm:text-4xl">
            {proposal.title}
          </h3>
          <Article className="mt-8">{proposal.extension?.body}</Article>
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
        <div className="flex items-center justify-between py-6">
          <h2 className="text-2xl font-bold tabular-nums">
            {proposal.votes
              ? proposal.votes === 1
                ? '1 Vote'
                : `${proposal.votes} Votes`
              : null}
          </h2>
          <div className="flex rounded-md">
            <VoterSelect
              proposal={query.proposal}
              workgroup={workgroup}
              snapshots={proposal.snapshots}
              value={did}
              onChange={setDid}
              className="rounded-r-none focus:z-10 active:z-10"
            />
            <FormProvider {...methods}>
              <SigningVoteButton
                did={did}
                proposal={query.proposal}
                duration={workgroup.duration}
                icon={BoltIcon}
                onSuccess={handleSuccess}
                disabled={
                  choiceIsEmpty(proposal.voting_type, watch('choice')) ||
                  !votingPower ||
                  isFetching
                }
                className="rounded-l-none border-l-0 tabular-nums focus:z-10 active:z-10"
              >
                Vote{votingPower ? ` (${votingPower})` : null}
              </SigningVoteButton>
            </FormProvider>
          </div>
        </div>
        {votes?.length ? (
          <div className="mb-6 overflow-hidden rounded-md border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900"
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
                    className="py-3.5 pl-3 pr-4 text-right text-sm font-semibold text-gray-900"
                  >
                    Power
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {votes.map((vote) => (
                  <tr key={vote.permalink}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                      {vote.authorship.author}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {stringifyChoice(proposal.voting_type, vote.choice)}
                    </td>
                    <td className="whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium tabular-nums">
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
          </div>
        ) : null}
      </div>
      <div className="relative w-full shrink-0 sm:sticky sm:top-24 sm:w-72">
        <StatusIcon
          permalink={query.proposal}
          className="absolute right-4 top-4"
        />
        <div className="space-y-6 rounded-md border border-gray-200 p-6">
          <DetailList title="Proposal">
            <DetailItem title="Community">{community.name}</DetailItem>
            <DetailItem title="Workgroup">{workgroup.name}</DetailItem>
            <DetailItem title="Proposer">
              {proposal.authorship.author}
            </DetailItem>
            <DetailItem title="Voting type">
              {startCase(proposal.voting_type)}
            </DetailItem>
          </DetailList>
          <ProposalSchedule
            proposal={query.proposal}
            duration={workgroup.duration}
          />
          <DetailList title="Terms and conditions">
            <Article small className="pt-2">
              {workgroup?.extension.terms_and_conditions}
            </Article>
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
