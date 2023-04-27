import { inferRouterOutputs } from '@trpc/server'
import clsx from 'clsx'
import Decimal from 'decimal.js'
import { useCallback, useMemo } from 'react'
import { gray } from 'tailwindcss/colors'

import { GroupProposalVoteChoiceRouter } from '../server/routers/choice'
import { GroupProposal } from '../utils/schemas/group-proposal'
import { updateChoice } from '../utils/choice'

export function ChoiceListItem(props: {
  type: GroupProposal['voting_type']
  option: string
  votingPower?: Decimal
  choices?: inferRouterOutputs<GroupProposalVoteChoiceRouter>['groupByProposal']
  disabled?: boolean
  value?: Record<string, string>
  onChange(value: Record<string, string>): void
}) {
  const { type, option, votingPower, choices, value, onChange } = props
  const newPower = useMemo(
    () => new Decimal(votingPower ? value?.[option] || 0 : 0),
    [option, value, votingPower],
  )
  const percentage = useMemo(() => {
    const denominator = new Decimal(choices?.total || 0).add(
      new Decimal(Object.keys(value || {}).length ? votingPower || 0 : 0),
    )
    if (denominator.isZero()) {
      return new Decimal(0)
    }
    return new Decimal(new Decimal(choices?.powers[option] || 0).add(newPower))
      .mul(100)
      .dividedBy(denominator)
  }, [choices, newPower, option, value, votingPower])
  const checked = useMemo(() => {
    try {
      return new Decimal(value?.[option] || 0).gt(0)
    } catch {
      return false
    }
  }, [option, value])
  const handleClick = useCallback(() => {
    if (!props.disabled && votingPower) {
      onChange(updateChoice(type, value || {}, option, votingPower.toString()))
    }
  }, [onChange, option, props.disabled, type, value, votingPower])

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
      onClick={handleClick}
    >
      <span className="w-0 flex-1 truncate">{option}</span>
      {choices?.powers[option] || newPower.gt(0) ? (
        <span className="text-xs text-gray-800">
          {newPower.add(choices?.powers[option] || 0).toString()}&nbsp;(
          {percentage.toFixed(1)}%)
        </span>
      ) : null}
      <div className="ml-4 shrink-0 leading-none">
        <input
          type={type === 'single' ? 'radio' : 'checkbox'}
          checked={checked}
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
