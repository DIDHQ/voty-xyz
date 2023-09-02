import { useMemo } from 'react'

import useDids from '../hooks/use-dids'
import useWallet from '../hooks/use-wallet'
import { BooleanSets, DecimalSets } from '../utils/schemas/basic/sets'
import { formatDid } from '../utils/did/utils'
import Card from './basic/card'
import Tag from './basic/tag'

export default function PermissionCard(props: {
  title: string
  description: string
  value: BooleanSets | DecimalSets
}) {
  const { account } = useWallet()
  const { data: dids } = useDids(account)
  const didSet = useMemo(() => new Set(dids || []), [dids])

  return (
    <Card title={props.title} subtitle={props.description}>
      <ul>
        {props.value.operands.map((operand, index) => (
          <li key={index}>
            {props.value.operands.length === 1 || !operand.name ? null : (
              <h4 className="mb-3 text-sm-semibold text-strong">
                {operand.name}
              </h4>
            )}

            {operand.arguments[1].length ? (
              <div className="flex flex-wrap gap-3">
                {operand.arguments[1].map((argument) => (
                  <Tag
                    key={argument}
                    size="large"
                    color={
                      didSet.has(`${argument}.${operand.arguments[0]}`)
                        ? 'green'
                        : 'default'
                    }
                  >
                    {formatDid(`${argument}.${operand.arguments[0]}`)}
                  </Tag>
                ))}
              </div>
            ) : (
              <div className="text-sm-regular text-strong">
                {operand.arguments[0] === 'bit' ? (
                  <Tag size="large">All .bit accounts</Tag>
                ) : (
                  <Tag
                    color={
                      didSet.has(operand.arguments[0]) ? 'green' : 'default'
                    }
                    size="large"
                  >
                    All SubDIDs of {operand.arguments[0]}
                  </Tag>
                )}
              </div>
            )}

            {operand.arguments[2] ? (
              <p className="mt-4 text-sm-medium text-semistrong">
                Voting power: {operand.arguments[2]}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </Card>
  )
}
