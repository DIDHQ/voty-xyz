import {
  Button,
  Classes,
  DialogStep,
  DialogStepId,
  FormGroup,
  InputGroup,
  MultistepDialog,
  Radio,
  RadioGroup,
  TextArea,
} from '@blueprintjs/core'
import { CoinType, createInstance } from 'dotbit'
import { useCallback, useEffect, useState } from 'react'
import {
  FormProvider,
  useForm,
  useFormContext,
  UseFormRegisterReturn,
} from 'react-hook-form'
import useSWR from 'swr'
import { useAccount } from 'wagmi'
import AvatarUploader from './avatar-uploader'

const dotbit = createInstance()

export default function SetupOrganizationDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [did, setDid] = useState('')
  const methods = useForm<Profile>()
  const [stepId, setStepId] = useState<DialogStepId>('')
  const onSubmit = useCallback((data: Profile) => {
    console.log(data)
    setIsOpen(false)
  }, [])
  useEffect(() => {
    setStepId('did')
  }, [isOpen])

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Setup Organization</Button>
      <MultistepDialog
        title="Setup Organization"
        icon="settings"
        nextButtonProps={{
          disabled: {
            did: !did,
            profile: !methods.watch('name'),
          }[stepId],
        }}
        finalButtonProps={{
          onClick: methods.handleSubmit(onSubmit),
        }}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        usePortal={false}
        onChange={setStepId}
      >
        <DialogStep
          id="did"
          title="Choose DID"
          panel={<ChooseDidPanel value={did} onChange={setDid} />}
        />
        <DialogStep
          id="profile"
          title="Profile"
          panel={
            <FormProvider {...methods}>
              <ProfilePanel did={did} />
            </FormProvider>
          }
        />
        <DialogStep
          id="proposers"
          title="Proposers"
          panel={<ProposersPanel />}
        />
        <DialogStep id="voters" title="Voters" panel={<VotersPanel />} />
      </MultistepDialog>
    </>
  )
}

function ChooseDidPanel(props: {
  value: string
  onChange(value: string): void
}) {
  const account = useAccount()
  const { data: accounts } = useSWR(
    account.address ? ['accounts', account.address] : null,
    () => {
      return dotbit.accountsOfOwner({
        key: account.address!,
        coin_type: CoinType.ETH,
      })
    },
  )

  return (
    <div className={Classes.DIALOG_BODY}>
      <RadioGroup
        label="Choose one of your DIDs as organization id."
        inline
        selectedValue={props.value}
        onChange={(e) => props.onChange(e.currentTarget.value)}
      >
        {accounts?.map((account) => (
          <Radio key={account.account} value={account.account}>
            {account.account}
          </Radio>
        ))}
      </RadioGroup>
    </div>
  )
}

type Profile = {
  avatar: string
  name: string
  about: string
  website: string
  tos: string
}

function ProfilePanel(props: { did: string }) {
  const { register } = useFormContext<Profile>()

  return (
    <div className={Classes.DIALOG_BODY}>
      <FormGroup label="Avatar">
        <AvatarUploader did={props.did} {...wrapRegister(register('avatar'))} />
      </FormGroup>
      <FormGroup label="Name" labelInfo="(Required)">
        <InputGroup {...wrapRegister(register('name', { required: true }))} />
      </FormGroup>
      <FormGroup label="About">
        <TextArea fill {...wrapRegister(register('about'))} />
      </FormGroup>
      <FormGroup label="Website">
        <InputGroup
          leftIcon="globe-network"
          {...wrapRegister(register('website'))}
        />
      </FormGroup>
      <FormGroup label="Terms of service">
        <InputGroup
          leftIcon="globe-network"
          {...wrapRegister(register('tos'))}
        />
      </FormGroup>
    </div>
  )
}

function ProposersPanel(props: {}) {
  return null
}

function VotersPanel(props: {}) {
  return null
}

function wrapRegister<T>(value: UseFormRegisterReturn) {
  const { ref, ...rest } = value
  return { inputRef: ref, ...rest }
}
