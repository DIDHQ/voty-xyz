import { useMemo, useState } from 'react'
import useSWR from 'swr'
import DidSelect from '../components/did-select'
import {
  check_proposer_liberty,
  required_coin_types_of_proposer_liberty,
} from '../src/functions/proposer-liberty'
import { DID } from '../src/functions/types'
import {
  calculate_voting_power,
  required_coin_types_of_voting_power,
} from '../src/functions/voting-power'
import { ProposerLibertySets, VotingPowerSets } from '../src/schemas'

const defaultProposerLiberty: ProposerLibertySets = {
  operator: 'or',
  operands: [
    {
      function: 'exact_did',
      arguments: [['aliez.eth', 'regex.bit', 'vitalik.eth']],
    },
    {
      function: 'sub_did',
      arguments: [['regex.bit']],
    },
  ],
}

const defaultVotingPower: VotingPowerSets = {
  operator: 'sum',
  operands: [
    {
      function: 'weight_list',
      arguments: [
        [
          ['aliez.eth', 1],
          ['regex.bit', 5],
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
  const {
    data: checked,
    isValidating: isCheckedValidating,
    error: checkedError,
  } = useSWR(
    proposerLiberty ? ['proposerLiberty', proposerLiberty, text] : null,
    () => check_proposer_liberty(JSON.parse(proposerLiberty), text as DID, {}),
    { revalidateOnFocus: false },
  )
  const {
    data: calculated,
    isValidating: isCalculatedValidating,
    error: calculatedError,
  } = useSWR(
    votingPower ? ['votingPower', votingPower, text] : null,
    () => calculate_voting_power(JSON.parse(votingPower), text as DID, {}),
    { revalidateOnFocus: false },
  )
  const requiredCoinTypesOfProposerLiberty = useMemo(() => {
    try {
      return required_coin_types_of_proposer_liberty(
        JSON.parse(proposerLiberty),
      )
    } catch {
      return []
    }
  }, [proposerLiberty])
  const requiredCoinTypesOfVotingPower = useMemo(() => {
    try {
      return required_coin_types_of_voting_power(JSON.parse(votingPower))
    } catch {
      return []
    }
  }, [votingPower])

  return (
    <>
      <br />
      <table border={1} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th />
            <th>Proposer Liberty</th>
            <th>Voting Power</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>input data</td>
            <td>
              <textarea
                value={proposerLiberty}
                onChange={(e) => setProposerLiberty(e.target.value)}
                style={{ height: 500, width: 400 }}
              />
            </td>
            <td>
              <textarea
                value={votingPower}
                onChange={(e) => setVotingPower(e.target.value)}
                style={{ height: 500, width: 400 }}
              />
            </td>
          </tr>
          <tr>
            <td>result</td>
            <td>{checked === true ? '✅' : checked === false ? '❌' : null}</td>
            <td>{calculated}</td>
          </tr>
          <tr>
            <td>error</td>
            <td>{checkedError?.message}</td>
            <td>{calculatedError?.message}</td>
          </tr>
          <tr>
            <td>loading</td>
            <td>{isCheckedValidating ? 'loading' : 'idle'}</td>
            <td>{isCalculatedValidating ? 'loading' : 'idle'}</td>
          </tr>
          <tr>
            <td>required coin types</td>
            <td>{JSON.stringify(requiredCoinTypesOfProposerLiberty)}</td>
            <td>{JSON.stringify(requiredCoinTypesOfVotingPower)}</td>
          </tr>
        </tbody>
      </table>
      <br />
      <label>test DID: </label>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <DidSelect value={text} onChange={setText} />
    </>
  )
}
