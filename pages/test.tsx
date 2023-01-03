import { createInstance } from 'dotbit'
import { useMemo, useState } from 'react'
import useSWR from 'swr'
import { useAccount } from 'wagmi'
import {
  checkProposerLiberty,
  requiredCoinTypesOfProposerLiberty,
} from '../src/functions/proposer-liberty'
import { DID } from '../src/functions/types'
import {
  calculateVotingPower,
  requiredCoinTypesOfVotingPower,
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
    () => checkProposerLiberty(JSON.parse(proposerLiberty), text as DID, {}),
    { revalidateOnFocus: false },
  )
  const {
    data: calculated,
    isValidating: isCalculatedValidating,
    error: calculatedError,
  } = useSWR(
    votingPower ? ['votingPower', votingPower, text] : null,
    () => calculateVotingPower(JSON.parse(votingPower), text as DID, {}),
    { revalidateOnFocus: false },
  )
  const requiredCoinTypesOfProposerLiberty = useMemo(() => {
    try {
      return requiredCoinTypesOfProposerLiberty(JSON.parse(proposerLiberty))
    } catch {
      return []
    }
  }, [proposerLiberty])
  const requiredCoinTypesOfVotingPower = useMemo(() => {
    try {
      return requiredCoinTypesOfVotingPower(JSON.parse(votingPower))
    } catch {
      return []
    }
  }, [votingPower])
  const account = useAccount()
  const { data: accounts } = useSWR(
    account.address ? ['account', account] : null,
    async () => {
      const dotbit = createInstance()
      const accounts = await dotbit.accountsOfOwner({ key: account.address! })
      return accounts.map(({ account }) => account)
    },
    { revalidateOnFocus: false },
  )

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
      <select value={text} onChange={(e) => setText(e.target.value)}>
        <option />
        {accounts?.map((account) => (
          <option key={account} value={account}>
            {account}
          </option>
        ))}
      </select>
    </>
  )
}
