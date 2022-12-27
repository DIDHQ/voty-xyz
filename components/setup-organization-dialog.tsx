import {
  Button,
  Classes,
  DialogStep,
  FileInput,
  FormGroup,
  InputGroup,
  MultistepDialog,
  Radio,
  RadioGroup,
  TextArea,
} from '@blueprintjs/core'
import { CoinType, createInstance } from 'dotbit'
import { useState } from 'react'
import useSWR from 'swr'
import { useAccount } from 'wagmi'
import AvatarUploader from './avatar-uploader'

const dotbit = createInstance()

export default function SetupOrganizationDialog() {
  const [isOpen, setIsOpen] = useState(false)
  const [did, setDid] = useState('')
  const [profile, setProfile] = useState<Profile>({})

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Setup Organization</Button>
      <MultistepDialog
        title="Setup Organization"
        icon="settings"
        nextButtonProps={{ disabled: !did }}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <DialogStep
          id="did"
          title="Choose DID"
          panel={<ChooseDidPanel value={did} onChange={setDid} />}
        />
        <DialogStep
          id="profile"
          title="Profile"
          panel={<ProfilePanel value={profile} onChange={setProfile} />}
        />
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
  avatar?: string
}

function ProfilePanel(props: {
  value: Profile
  onChange(value: Profile): void
}) {
  return (
    <div className={Classes.DIALOG_BODY}>
      <FormGroup label="Avatar">
        <AvatarUploader value={props.value.avatar} onChange={() => {}} />
      </FormGroup>
      <FormGroup label="Name">
        <InputGroup />
      </FormGroup>
      <FormGroup label="About">
        <TextArea fill />
      </FormGroup>
      <FormGroup label="Website">
        <InputGroup leftIcon="globe-network" />
      </FormGroup>
      <FormGroup label="Terms of service">
        <InputGroup leftIcon="globe-network" />
      </FormGroup>
    </div>
  )
}
