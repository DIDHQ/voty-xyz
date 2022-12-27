import {
  Button,
  Classes,
  DialogStep,
  DialogStepId,
  FormGroup,
  InputGroup,
  Intent,
  MultistepDialog,
  NonIdealState,
  Radio,
  RadioGroup,
  TextArea,
  Toaster,
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
import useAsync from '../hooks/use-async'
import { Organization } from '../src/schemas'
import AvatarUploader from './avatar-uploader'

const dotbit = createInstance()

const toaster = Toaster.create()

export default function SetupOrganizationDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const methods = useForm<Organization>()
  const [stepId, setStepId] = useState<DialogStepId>('')
  const handleSubmit = useAsync(
    useCallback(async (data: Organization) => {
      const response = await fetch('/api/setup-organization', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      })
      const text = await response.text()
      if (!response.ok) {
        throw new Error(text)
      }
      return text
    }, []),
  )
  useEffect(() => {
    setStepId('did')
  }, [isOpen])
  useEffect(() => {
    if (handleSubmit.status === 'success') {
      setIsOpen(false)
    }
  }, [handleSubmit.status])
  useEffect(() => {
    if (handleSubmit.value) {
      toaster.show({
        intent: Intent.SUCCESS,
        message: handleSubmit.value,
      })
    }
  }, [handleSubmit.value])
  useEffect(() => {
    if (handleSubmit.error) {
      toaster.show({
        intent: Intent.DANGER,
        message: handleSubmit.error.message,
      })
    }
  }, [handleSubmit.error])

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Setup Organization</Button>
      <MultistepDialog
        title={
          methods.watch('organization')
            ? `Setup Organization for ${methods.watch('organization')}`
            : 'Setup Organization'
        }
        icon="settings"
        nextButtonProps={{
          disabled: {
            did: !methods.watch('organization'),
            profile: !methods.watch('profile.name'),
          }[stepId],
        }}
        finalButtonProps={{
          loading: handleSubmit.status === 'pending',
          onClick: methods.handleSubmit(handleSubmit.execute),
        }}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        usePortal={false}
        onChange={setStepId}
      >
        <DialogStep
          id="did"
          title="Choose DID"
          panel={
            <FormProvider {...methods}>
              <ChooseDidPanel />
            </FormProvider>
          }
        />
        <DialogStep
          id="profile"
          title="Profile"
          panel={
            <FormProvider {...methods}>
              <ProfilePanel />
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

function ChooseDidPanel() {
  const { setValue, watch } = useFormContext<Organization>()
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
        selectedValue={watch('organization')}
        onChange={(e) => setValue('organization', e.currentTarget.value)}
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

function ProfilePanel() {
  const { register, setValue, watch } = useFormContext<Organization>()

  return (
    <div className={Classes.DIALOG_BODY}>
      <FormGroup label="Avatar">
        <AvatarUploader
          did={watch('organization')}
          onChange={(v) =>
            setValue('profile.avatar', Buffer.from(v).toString('base64'))
          }
        />
      </FormGroup>
      <FormGroup label="Name" labelInfo="(Required)">
        <InputGroup
          {...wrapRegister(register('profile.name', { required: true }))}
        />
      </FormGroup>
      <FormGroup label="About">
        <TextArea fill {...wrapRegister(register('profile.about'))} />
      </FormGroup>
      <FormGroup label="Website">
        <InputGroup
          leftIcon="globe-network"
          {...wrapRegister(register('profile.website'))}
        />
      </FormGroup>
      <FormGroup label="Terms of service">
        <InputGroup
          leftIcon="globe-network"
          {...wrapRegister(register('profile.tos'))}
        />
      </FormGroup>
    </div>
  )
}

function ProposersPanel(props: {}) {
  return (
    <div className={Classes.DIALOG_BODY}>
      <NonIdealState title="WIP" icon="build" />
    </div>
  )
}

function VotersPanel(props: {}) {
  return (
    <div className={Classes.DIALOG_BODY}>
      <NonIdealState title="WIP" icon="build" />
    </div>
  )
}

function wrapRegister<T>(value: UseFormRegisterReturn) {
  const { ref, ...rest } = value
  return { inputRef: ref, ...rest }
}
