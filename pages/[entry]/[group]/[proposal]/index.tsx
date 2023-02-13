import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import useSWR from 'swr'
import clsx from 'clsx'
import Link from 'next/link'
import dynamic from 'next/dynamic'

import {
  useTurnout,
  useListVotes,
  useRetrieve,
  useGroup,
} from '../../../../hooks/use-api'
import useRouterQuery from '../../../../hooks/use-router-query'
import { calculateNumber } from '../../../../src/functions/number'
import { Vote, voteSchema } from '../../../../src/schemas'
import { mapSnapshots } from '../../../../src/snapshot'
import { DID, Turnout } from '../../../../src/types'
import useStatus from '../../../../hooks/use-status'
import Card from '../../../../components/basic/card'
import { Grid6, GridItem6 } from '../../../../components/basic/grid'
import {
  checkChoice,
  choiceIsEmpty,
  powerOfChoice,
  updateChoice,
} from '../../../../src/voting'
import TextButton from '../../../../components/basic/text-button'
import Markdown from '../../../../components/basic/markdown'
import { DataType } from '../../../../src/constants'

const AuthorSelect = dynamic(
  () => import('../../../../components/author-select'),
  { ssr: false },
)

const SigningButton = dynamic(
  () => import('../../../../components/signing-button'),
  { ssr: false },
)

export default function ProposalPage() {
  const query = useRouterQuery<['proposal']>()
  const { data: proposal } = useRetrieve(DataType.PROPOSAL, query.proposal)
  const { data: community } = useRetrieve(
    DataType.COMMUNITY,
    proposal?.community,
  )
  const group = useGroup(community, proposal?.group)
  const { data: status } = useStatus(query.proposal)
  const { data: turnout, mutate: mutateTurnout } = useTurnout(query.proposal)
  const [did, setDid] = useState('')
  const methods = useForm<Vote>({
    resolver: zodResolver(voteSchema),
  })
  const { setValue, resetField, control } = methods
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
  const handleSuccess = useCallback(() => {
    mutateList()
    mutateTurnout()
    setValue('choice', '')
  }, [mutateList, mutateTurnout, setValue])

  return community && proposal && group ? (
    <div className="flex py-6">
      <div className="mr-6 flex-[2_2_0%]">
        <div>
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
                    turnout={turnout}
                    value={value}
                    onChange={onChange}
                  />
                ))}
              </>
            )}
          />
        </ul>
        <div className="py-6">
          <div className="flex justify-end">
            <AuthorSelect value={did} onChange={setDid} top className="mr-6" />
            <FormProvider {...methods}>
              <SigningButton
                did={did}
                onSuccess={handleSuccess}
                disabled={!votingPower || isValidating}
              >
                Vote {votingPower}
              </SigningButton>
            </FormProvider>
          </div>
        </div>
        {votes?.length ? (
          <ul
            role="list"
            className="divide-y divide-gray-200 rounded-md border border-gray-200"
          >
            {votes?.map((vote) => (
              <li
                key={vote.permalink}
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
  turnout?: Turnout
  value: string
  onChange(value: string): void
}) {
  const { type, option, votingPower = 0, turnout, value, onChange } = props
  const percentage = useMemo(() => {
    const power = powerOfChoice(type, value, votingPower)[option] || 0
    const denominator =
      (turnout?.total || 0) + (choiceIsEmpty(type, value) ? 0 : votingPower)
    if (denominator === 0) {
      return 0
    }
    return (((turnout?.powers[option] || 0) + power) / denominator) * 100
  }, [option, turnout?.powers, turnout?.total, type, value, votingPower])

  return (
    <li
      className="flex items-center justify-between bg-no-repeat py-3 pl-2 pr-4 text-sm"
      style={{
        transition: 'background-size 0.3s ease-out',
        backgroundImage: `linear-gradient(90deg, #f3f4f6 100%, transparent 100%)`,
        backgroundSize: `${percentage}% 100%`,
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
