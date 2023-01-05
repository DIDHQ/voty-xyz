import { useMemo, useState } from 'react'
import { Input, Table, Textarea } from 'react-daisyui'
import useSWR from 'swr'
import DidSelect from '../components/did-select'
import FormItem from '../components/form-item'
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

  return (
    <>
      <Table border={1} style={{ borderCollapse: 'collapse' }}>
        <Table.Head>
          <span />
          <span>Proposer Liberty</span>
          <span>Voting Power</span>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <span>input data</span>
            <span>
              <Textarea
                value={proposerLiberty}
                onChange={(e) => setProposerLiberty(e.target.value)}
                style={{ height: 500, width: 400 }}
              />
            </span>
            <span>
              <Textarea
                value={votingPower}
                onChange={(e) => setVotingPower(e.target.value)}
                style={{ height: 500, width: 400 }}
              />
            </span>
          </Table.Row>
          <Table.Row>
            <span>result</span>
            <span>
              {checked === true ? '✅' : checked === false ? '❌' : null}
            </span>
            <span>{calculated}</span>
          </Table.Row>
          <Table.Row>
            <span>error</span>
            <span>{checkedError?.message}</span>
            <span>{calculatedError?.message}</span>
          </Table.Row>
          <Table.Row>
            <span>loading</span>
            <span>{isCheckedValidating ? 'loading' : 'idle'}</span>
            <span>{isCalculatedValidating ? 'loading' : 'idle'}</span>
          </Table.Row>
          <Table.Row>
            <span>required coin types</span>
            <span>{JSON.stringify(coinTypesOfProposerLiberty)}</span>
            <span>{JSON.stringify(coinTypesOfVotingPower)}</span>
          </Table.Row>
        </Table.Body>
      </Table>
      <FormItem label="test DID">
        <Input value={text} onChange={(e) => setText(e.target.value)} />
        <DidSelect value={text} onChange={setText} />
      </FormItem>
    </>
  )
}
