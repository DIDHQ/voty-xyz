import clsx from 'clsx'
import Decimal from 'decimal.js'
import { useMemo } from 'react'
import { gray } from 'tailwindcss/colors'

import { GroupProposal } from '../utils/schemas/v1/group-proposal'
import {
  powerOfChoice,
  choiceIsEmpty,
  updateChoice,
  checkChoice,
} from '../utils/choice'
import { PositiveDecimal } from '../utils/schemas/basic/positive-decimal'

export function ChoiceListItem(props: {
  type: GroupProposal['voting_type']
  choice: string
  votingPower?: Decimal
  choices?: Record<string, PositiveDecimal>
  disabled?: boolean
  value?: Record<string, PositiveDecimal>
  onChange(value: Record<string, PositiveDecimal>): void
}) {
  const { type, choice, votingPower, choices, value, onChange } = props
  const newPower = useMemo(
    () =>
      votingPower
        ? powerOfChoice(value, votingPower)[choice] || new Decimal(0)
        : new Decimal(0),
    [choice, value, votingPower],
  )
  const total = useMemo(
    () =>
      Object.values(choices || {}).reduce(
        (sum, power) => sum.add(power),
        new Decimal(0),
      ),
    [choices],
  )
  const percentage = useMemo(() => {
    const denominator = total.add(
      new Decimal(choiceIsEmpty(value) ? 0 : votingPower || 0),
    )
    if (denominator.isZero()) {
      return new Decimal(0)
    }
    return new Decimal(new Decimal(choices?.[choice] || 0).add(newPower))
      .mul(100)
      .dividedBy(denominator)
  }, [choices, newPower, choice, total, value, votingPower])

  return (
    <li
      className={clsx(
        'group flex items-start justify-between bg-no-repeat px-4 py-3 text-sm',
        props.disabled ? 'cursor-not-allowed' : 'cursor-pointer',
      )}
      style={{
        transition: 'background-size 0.3s ease-out',
        backgroundImage: `linear-gradient(90deg, ${gray['100']} 100%, transparent 100%)`,
        backgroundSize: `${percentage.toFixed(3)}% 100%`,
      }}
      onClick={() => {
        if (!props.disabled) {
          onChange(updateChoice(value, choice))
        }
      }}
    >
      <span className="w-0 flex-1">{choice}</span>
      {choices?.[choice] || newPower.gt(0) ? (
        <span className="mt-[0.09375rem] text-xs text-gray-800">
          {newPower.add(choices?.[choice] || 0).toString()} (
          {percentage.toFixed(1)}%)
        </span>
      ) : null}
      <div className="ml-4 mt-[0.09375rem] shrink-0 leading-none">
        <input
          type={type === 'single' ? 'radio' : 'checkbox'}
          checked={checkChoice(value, choice)}
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
