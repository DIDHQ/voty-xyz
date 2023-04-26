import { inferRouterOutputs } from '@trpc/server'
import clsx from 'clsx'
import Decimal from 'decimal.js'
import { useMemo } from 'react'
import { gray } from 'tailwindcss/colors'

import { GroupProposalVoteChoiceRouter } from '../server/routers/choice'
import { GroupProposal } from '../utils/schemas/group-proposal'
import {
  powerOfChoice,
  choiceIsEmpty,
  updateChoice,
  checkChoice,
} from '../utils/choice'

export function ChoiceListItem(props: {
  type: GroupProposal['voting_type']
  option: string
  votingPower?: Decimal
  choices?: inferRouterOutputs<GroupProposalVoteChoiceRouter>['groupByProposal']
  disabled?: boolean
  value: string
  onChange(value: string): void
}) {
  const { type, option, votingPower, choices, value, onChange } = props
  const newPower = useMemo(
    () =>
      votingPower
        ? powerOfChoice(type, value, votingPower)[option] || new Decimal(0)
        : new Decimal(0),
    [option, type, value, votingPower],
  )
  const percentage = useMemo(() => {
    const denominator = new Decimal(choices?.total || 0).add(
      new Decimal(choiceIsEmpty(type, value) ? 0 : votingPower || 0),
    )
    if (denominator.isZero()) {
      return new Decimal(0)
    }
    return new Decimal(new Decimal(choices?.powers[option] || 0).add(newPower))
      .mul(100)
      .dividedBy(denominator)
  }, [choices, newPower, option, type, value, votingPower])

  return (
    <li
      className={clsx(
        'group flex items-center justify-between bg-no-repeat px-4 py-3 text-sm',
        props.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      )}
      style={{
        transition: 'background-size 0.3s ease-out',
        backgroundImage: `linear-gradient(90deg, ${gray['100']} 100%, transparent 100%)`,
        backgroundSize: `${percentage.toFixed(3)}% 100%`,
      }}
      onClick={() => {
        if (!props.disabled) {
          onChange(updateChoice(type, value, option))
        }
      }}
    >
      <span className="w-0 flex-1 truncate">{option}</span>
      {choices?.powers[option] || newPower.gt(0) ? (
        <span className="text-xs text-gray-800">
          {choices?.powers[option] || 0}
          {newPower.gt(0) ? ` + ${newPower.toString()}` : ''}&nbsp;(
          {percentage.toFixed(1)}%)
        </span>
      ) : null}
      <div className="ml-4 shrink-0 leading-none">
        <input
          type={type === 'single' ? 'radio' : 'checkbox'}
          checked={checkChoice(type, value, option)}
          disabled={props.disabled}
          onChange={() => null}
          className={clsx(
            'h-4 w-4 cursor-pointer border border-gray-300 text-primary-600 focus:ring-primary-300 disabled:cursor-not-allowed disabled:bg-gray-50 checked:disabled:bg-primary-600',
            props.disabled ? undefined : 'group-hover:border-primary-400',
            type === 'single' ? undefined : 'rounded',
          )}
        />
      </div>
    </li>
  )
}
