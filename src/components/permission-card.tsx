import { BooleanSets, DecimalSets } from '../utils/schemas/sets'

export default function PermissionCard(props: {
  title: string
  description: string
  entry?: string
  value: BooleanSets | DecimalSets
}) {
  return (
    <>
      <h3>{props.title}</h3>
      <em>{props.description}</em>
      <ul>
        {props.value.operands.map((operand, index) => (
          <li key={index}>
            <b>{operand.name || `Filter ${index + 1}`}</b>:
            {operand.arguments[1].length
              ? null
              : operand.arguments[0] === 'bit'
              ? ' All .bit accounts'
              : ` All SubDIDs of ${props.entry}`}
            {operand.arguments[2] ? ` (Power: ${operand.arguments[2]})` : null}
            {operand.arguments[1].length ? (
              <ul>
                {operand.arguments[1].map((argument) => (
                  <li key={argument}>
                    {argument}.{operand.arguments[0]}
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ul>
    </>
  )
}
