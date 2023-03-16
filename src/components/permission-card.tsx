import clsx from 'clsx'
import { ReactNode } from 'react'

import { BooleanSets, DecimalSets } from '../utils/schemas/sets'

export default function PermissionCard(props: {
  title: string
  description: string
  entry?: string
  value: BooleanSets | DecimalSets
}) {
  return (
    <div className="rounded border p-6">
      <h3 className="text-xl font-semibold">{props.title}</h3>
      <p className="mt-1 text-gray-500">{props.description}</p>
      <ul className="mt-6 divide-y border-t">
        {props.value.operands.map((operand, index) => (
          <li key={index} className="pt-6">
            <h4 className="mb-3 text-base font-medium">
              {operand.name || `Filter ${index + 1}`}
            </h4>
            {operand.arguments[1].length ? (
              <div className="-m-1">
                {operand.arguments[1].map((argument) => (
                  <Tag key={argument} className="m-1">
                    {argument}.{operand.arguments[0]}
                  </Tag>
                ))}
              </div>
            ) : (
              <span className="text-sm text-gray-600">
                {operand.arguments[0] === 'bit'
                  ? 'All .bit accounts'
                  : `All SubDIDs of ${props.entry}`}
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

function Tag(props: { children: ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full bg-gray-100 px-3 py-0.5 text-sm font-medium text-gray-700',
        props.className,
      )}
    >
      {props.children}
    </span>
  )
}
