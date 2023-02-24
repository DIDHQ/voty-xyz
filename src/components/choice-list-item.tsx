import { inferRouterOutputs } from '@trpc/server'
import clsx from 'clsx'
import Decimal from 'decimal.js'
import { useMemo } from 'react'
import { gray } from 'tailwindcss/colors'

import { ChoiceRouter } from '../server/routers/choice'
import {
  powerOfChoice,
  choiceIsEmpty,
  updateChoice,
  checkChoice,
} from '../utils/voting'

export function ChoiceListItem(props: {
  type: 'single' | 'multiple'
  option: string
  votingPower?: Decimal
  choices?: inferRouterOutputs<ChoiceRouter>['groupByProposal']
  disabled?: boolean
  value: string
  onChange(value: string): void
}) {
  const { type, option, votingPower, choices, value, onChange } = props
  const percentage = useMemo(() => {
    const power = votingPower
      ? powerOfChoice(type, value, votingPower)[option] || new Decimal(0)
      : new Decimal(0)
    const denominator = new Decimal(choices?.total || 0).add(
      new Decimal(choiceIsEmpty(type, value) ? 0 : votingPower || 0),
    )
    if (denominator.isZero()) {
      return new Decimal(0)
    }
    return new Decimal(new Decimal(choices?.powers[option] || 0).add(power))
      .mul(100)
      .dividedBy(denominator)
  }, [option, choices?.powers, choices?.total, type, value, votingPower])

  return (
    <li
      className="flex items-center justify-between bg-no-repeat py-3 px-4 text-sm"
      style={{
        transition: 'background-size 0.3s ease-out',
        backgroundImage: `linear-gradient(90deg, ${gray['100']} 100%, transparent 100%)`,
        backgroundSize: `${percentage.toFixed(2)}% 100%`,
      }}
      onClick={() => {
        if (!props.disabled) {
          onChange(updateChoice(type, value, option))
        }
      }}
    >
      <span className="w-0 flex-1 truncate">{option}</span>
      {percentage.gt(0) ? (
        <span className="text-xs text-gray-500">{percentage.toFixed(2)}%</span>
      ) : null}
      <div className="ml-4 shrink-0 leading-none">
        <input
          type={type === 'single' ? 'radio' : 'checkbox'}
          checked={checkChoice(type, value, option)}
          disabled={props.disabled}
          onChange={() => null}
          className={clsx(
            'h-4 w-4 border border-gray-300 text-primary-600 focus:ring-primary-500 disabled:cursor-not-allowed disabled:bg-gray-50 checked:disabled:bg-primary-600',
            type === 'single' ? undefined : 'rounded',
          )}
        />
      </div>
    </li>
  )
}
