import { ReactNode, useId, useState } from 'react'

import useArweaveData from '../../../hooks/use-arweave-data'
import useRouterQuery from '../../../hooks/use-router-query'
import { proposalWithSignatureSchema } from '../../../src/schemas'

export default function ProposalPage() {
  const [query] = useRouterQuery<['proposal']>()
  const { data: proposal } = useArweaveData(
    proposalWithSignatureSchema,
    query.proposal,
  )
  const [choice, setChoice] = useState('')

  return proposal ? (
    <>
      <h1>{proposal.title}</h1>
      <p>{proposal.body}</p>
      {proposal.type === 'single' ? (
        <>
          {proposal.choices.map((c) => (
            <Radio
              key={c}
              name="choice"
              value={c === choice}
              onChange={(e) => {
                if (e) {
                  setChoice(c)
                }
              }}
            >
              {c}
            </Radio>
          ))}
        </>
      ) : null}
    </>
  ) : null
}

function Radio(props: {
  name: string
  children: ReactNode
  value: boolean
  onChange(value: boolean): void
}) {
  const id = useId()

  return (
    <>
      <input
        type="radio"
        id={id}
        name={props.name}
        checked={props.value}
        onChange={(e) => props.onChange(e.target.checked)}
      />
      <label htmlFor={id}>{props.children}</label>
    </>
  )
}
