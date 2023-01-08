import { zodResolver } from '@hookform/resolvers/zod'
import { ReactNode, useEffect, useId, useState } from 'react'
import { Button } from 'react-daisyui'
import { Controller, useForm } from 'react-hook-form'

import DidSelect from '../../../components/did-select'
import { useList } from '../../../hooks/use-api'
import useArweaveData from '../../../hooks/use-arweave-data'
import useArweaveUpload from '../../../hooks/use-arweave-upload'
import useAsync from '../../../hooks/use-async'
import useRouterQuery from '../../../hooks/use-router-query'
import useSignJson from '../../../hooks/use-sign-json'
import useWallet from '../../../hooks/use-wallet'
import { DataType } from '../../../src/constants'
import {
  proposalWithSignatureSchema,
  Vote,
  voteSchema,
  VoteWithSignature,
} from '../../../src/schemas'

export default function ProposalPage() {
  const [query] = useRouterQuery<['proposal']>()
  const { data: proposal } = useArweaveData(
    proposalWithSignatureSchema,
    query.proposal,
  )
  const [did, setDid] = useState('')
  const { account } = useWallet()
  const { setValue, control, handleSubmit } = useForm<Vote>({
    resolver: zodResolver(voteSchema),
  })
  const handleSignJson = useAsync(useSignJson(did))
  const handleArweaveUpload = useAsync(useArweaveUpload(handleSignJson.value))
  useEffect(() => {
    if (proposal && query.proposal) {
      setValue('did', proposal.did)
      setValue('organization', proposal.organization)
      setValue('workgroup', proposal.workgroup)
      setValue('proposal', query.proposal)
    }
  }, [proposal, query.proposal, setValue])
  const { data: votes } = useList<VoteWithSignature>(DataType.VOTE, [
    ['proposal', query.proposal],
  ])

  return proposal ? (
    <>
      <h1>{proposal.title}</h1>
      <p>{proposal.body}</p>
      {proposal.type === 'single' ? (
        <Controller
          control={control}
          name="choice"
          render={({ field: { value, onChange } }) => (
            <>
              {proposal.choices.map((choice, index) => (
                <Radio
                  key={choice + index}
                  name="choice"
                  value={index === value}
                  onChange={(e) => {
                    if (e) {
                      onChange(index)
                    }
                  }}
                >
                  {choice}
                </Radio>
              ))}
            </>
          )}
        ></Controller>
      ) : null}
      <br />
      <DidSelect account={account} value={did} onChange={setDid} />
      <Button
        disabled={!did}
        onClick={handleSubmit(handleSignJson.execute, console.error)}
        loading={handleSignJson.status === 'pending'}
      >
        Sign
      </Button>
      <Button
        disabled={!handleSignJson.value}
        onClick={handleArweaveUpload.execute}
        loading={handleArweaveUpload.status === 'pending'}
      >
        Upload
      </Button>
      <ul>
        {votes?.map((vote, index) => (
          <li key={vote.id + index}>
            {vote.signature.did}: {vote.choice.toString()}
          </li>
        ))}
      </ul>
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
