import useArweaveData from '../../../hooks/use-arweave-data'
import useRouterQuery from '../../../hooks/use-router-query'
import { proposalWithSignatureSchema } from '../../../src/schemas'

export default function ProposalPage() {
  const [query] = useRouterQuery<['proposal']>()
  const { data: proposal } = useArweaveData(
    proposalWithSignatureSchema,
    query.proposal,
  )

  return proposal ? (
    <>
      <h1>{proposal.title}</h1>
      <p>{proposal.body}</p>
      <ul>
        {proposal.choices.map((choice) => (
          <li key={choice}>{choice}</li>
        ))}
      </ul>
    </>
  ) : null
}
