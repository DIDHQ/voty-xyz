import { useState } from 'react'
import useSWR from 'swr'
import { check_proposer_liberty } from '../src/functions/proposer-liberty'
import { DID } from '../src/functions/types'
import { calculate_voting_power } from '../src/functions/voting-power'
import { ProposerLibertySets, VotingPowerSets } from '../src/schemas'

const defaultProposerLiberty: ProposerLibertySets = {
  operator: 'or',
  operands: [
    {
      function: 'whitelist',
      arguments: [['regex.bit', 'vitalik.eth']],
    },
  ],
}

const defaultVotingPower: VotingPowerSets = {
  operator: 'sum',
  operands: [
    {
      function: 'whitelist',
      arguments: [
        [
          ['regex.bit', 1],
          ['vitalik.eth', 10],
        ],
      ],
    },
    {
      function: 'erc20_balance',
      arguments: [1, '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'],
    },
  ],
}

export default function TestPage() {
  const [text, setText] = useState('regex.bit')
  const [proposerLiberty, setProposerLiberty] = useState(
    JSON.stringify(defaultProposerLiberty, null, 2),
  )
  const [votingPower, setVotingPower] = useState(
    JSON.stringify(defaultVotingPower, null, 2),
  )
  const { data: checked } = useSWR(
    proposerLiberty ? ['proposerLiberty', proposerLiberty, text] : null,
    () => check_proposer_liberty(JSON.parse(proposerLiberty), text as DID, {}),
  )
  const { data: calculated } = useSWR(
    votingPower ? ['votingPower', votingPower, text] : null,
    () => calculate_voting_power(JSON.parse(votingPower), text as DID, {}),
  )

  return (
    <>
      <br />
      <label>DID: </label>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <h2>ProposerLiberty</h2>
      <textarea
        value={proposerLiberty}
        onChange={(e) => setProposerLiberty(e.target.value)}
      />
      <p>result: {checked ? '✅' : '❌'}</p>
      <h2>VotingPower</h2>
      <textarea
        value={votingPower}
        onChange={(e) => setVotingPower(e.target.value)}
      />
      <p>result: {calculated}</p>
    </>
  )
}
