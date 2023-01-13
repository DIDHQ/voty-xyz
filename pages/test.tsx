import { useMemo, useState } from 'react'
import useSWR from 'swr'

import DidSelect from '../components/did-select'
import FormItem from '../components/basic/form-item'
import useWallet from '../hooks/use-wallet'
import {
  checkProposerLiberty,
  requiredCoinTypesOfProposerLiberty,
} from '../src/functions/proposer-liberty'
import {
  calculateVotingPower,
  requiredCoinTypesOfVotingPower,
} from '../src/functions/voting-power'
import { ProposerLibertySets, VotingPowerSets } from '../src/schemas'
import { DID } from '../src/types'

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
  const [did, setDid] = useState('regex.bit')
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
    proposerLiberty ? ['proposerLiberty', proposerLiberty, did] : null,
    () => checkProposerLiberty(JSON.parse(proposerLiberty), did as DID, {}),
    { revalidateOnFocus: false },
  )
  const {
    data: calculated,
    isValidating: isCalculatedValidating,
    error: calculatedError,
  } = useSWR(
    votingPower ? ['votingPower', votingPower, did] : null,
    () => calculateVotingPower(JSON.parse(votingPower), did as DID, {}),
    { revalidateOnFocus: false },
  )
  const coinTypesOfProposerLiberty = useMemo(() => {
    try {
      return requiredCoinTypesOfProposerLiberty(JSON.parse(proposerLiberty))
    } catch {
      return []
    }
  }, [proposerLiberty])
  const coinTypesOfVotingPower = useMemo(() => {
    try {
      return requiredCoinTypesOfVotingPower(JSON.parse(votingPower))
    } catch {
      return []
    }
  }, [votingPower])
  const { account } = useWallet()

  return (
    <>
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
            <td>{JSON.stringify(coinTypesOfProposerLiberty)}</td>
            <td>{JSON.stringify(coinTypesOfVotingPower)}</td>
          </tr>
        </tbody>
      </table>
      <FormItem label="test DID">
        <input value={did} onChange={(e) => setDid(e.target.value)} />
        <DidSelect account={account} value={did} onChange={setDid} />
      </FormItem>
    </>
  )
}
