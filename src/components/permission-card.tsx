import clsx from 'clsx'
import { useMemo } from 'react'

import useDids from '../hooks/use-dids'
import useWallet from '../hooks/use-wallet'
import { BooleanSets, DecimalSets } from '../utils/schemas/sets'

export default function PermissionCard(props: {
  title: string
  description: string
  entry?: string
  value: BooleanSets | DecimalSets
}) {
  const { account } = useWallet()
  const { data: dids } = useDids(account)
  const didSet = useMemo(() => new Set(dids || []), [dids])

  return (
    <div className="rounded-md border p-6">
      <h3 className="text-xl font-semibold">{props.title}</h3>
      <p className="mt-1 text-sm text-gray-500">{props.description}</p>
      <ul className="mt-4 space-y-4 divide-y border-t">
        {props.value.operands.map((operand, index) => (
          <li key={index} className="pt-4">
            {props.value.operands.length === 1 ? null : (
              <h4 className="mb-3 text-base font-medium">
                {operand.name || `Group ${index + 1}`}
              </h4>
            )}
            {operand.arguments[1].length ? (
              <div className="-m-1">
                {operand.arguments[1].map((argument) => (
                  <Tag
                    key={argument}
                    highlight={didSet.has(
                      `${argument}.${operand.arguments[0]}`,
                    )}
                    className="m-1"
                  >
                    {`${argument}.${operand.arguments[0]}`}
                  </Tag>
                ))}
              </div>
            ) : (
              <span className="text-sm text-gray-600">
                {operand.arguments[0] === 'bit' ? (
                  'All .bit accounts'
                ) : (
                  <>
                    All SubDIDs of&nbsp;
                    {
                      <Tag highlight={props.entry === operand.arguments[0]}>
                        {operand.arguments[0]}
                      </Tag>
                    }
                  </>
                )}
              </span>
            )}
            {operand.arguments[2] ? (
              <p className="mt-3 text-sm text-gray-600">
                Voting power: {operand.arguments[2]}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Tag(props: {
  highlight?: boolean
  children: string
  className?: string
}) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full px-3 py-0.5 text-sm',
        props.highlight
          ? 'bg-primary-100 text-primary-700'
          : 'bg-gray-100 text-gray-700',
        props.className,
      )}
    >
      {props.children}
    </span>
  )
}
