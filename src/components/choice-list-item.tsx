import { clsx } from 'clsx'
import { Decimal } from 'decimal.js'
import { useMemo } from 'react'

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
        'group flex items-center justify-between gap-3 rounded-xl border border-base bg-gradient-to-r bg-no-repeat p-4 transition',
        props.disabled
          ? 'cursor-not-allowed opacity-80'
          : 'cursor-pointer hover:border-primary-500 hover:from-primary-500/5 hover:to-primary-500/5',
        checkChoice(value, choice)
          ? 'border-primary-500 from-primary-500/5 to-primary-500/5 ring-2 ring-primary-500/10'
          : 'from-[#F8FAFC] to-[#F8FAFC]',
      )}
      style={{
        transition: 'background-size 0.3s ease-out',
        backgroundSize: `${percentage.toFixed(3)}% 100%`,
      }}
      onClick={() => {
        if (!props.disabled) {
          onChange(updateChoice(value, choice))
        }
      }}
    >
      <input
        type={type === 'single' ? 'radio' : 'checkbox'}
        checked={checkChoice(value, choice)}
        disabled={props.disabled}
        onChange={() => null}
        className={clsx(
          'h-4 w-4 shrink-0 cursor-pointer border border-base text-primary-500 focus:outline-none focus:ring-0 focus:ring-transparent disabled:cursor-not-allowed',
          props.disabled ? undefined : 'group-hover:border-primary-500',
          type === 'single' ? undefined : 'rounded',
        )}
      />

      <span className="min-w-0 flex-1 text-sm-regular text-strong">
        {choice}
      </span>

      {choices?.[choice] || newPower.gt(0) ? (
        <span className="mt-[0.09375rem] text-xs text-moderate">
          {newPower.add(choices?.[choice] || 0).toString()} (
          {percentage.toFixed(1)}%)
        </span>
      ) : null}
    </li>
  )
}
