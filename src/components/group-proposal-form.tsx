import { zodResolver } from '@hookform/resolvers/zod'
import pMap from 'p-map'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { uniq } from 'lodash-es'
import { EyeIcon } from '@heroicons/react/20/solid'
import clsx from 'clsx'
import { useAtom } from 'jotai'
import { useRouter } from 'next/router'

import {
  GroupProposal,
  groupProposalSchema,
} from '../utils/schemas/v1/group-proposal'
import { getCurrentSnapshot } from '../utils/snapshot'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import TextButton from './basic/text-button'
import { Form, FormItem, FormSection } from './basic/form'
import { Grid6, GridItem2, GridItem6 } from './basic/grid'
import { requiredCoinTypeOfDidChecker } from '../utils/did'
import useStatus from '../hooks/use-status'
import { Group } from '../utils/schemas/v1/group'
import useWallet from '../hooks/use-wallet'
import useDids from '../hooks/use-dids'
import DidCombobox from './did-combobox'
import {
  checkBoolean,
  requiredCoinTypesOfBooleanSets,
} from '../utils/functions/boolean'
import { requiredCoinTypesOfDecimalSets } from '../utils/functions/decimal'
import Button from './basic/button'
import RadioGroup2 from './basic/radio-group2'
import { previewGroupProposalAtom } from '../utils/atoms'
import { previewPermalink } from '../utils/constants'
import Slide from './basic/slide'
import PermissionCard from './permission-card'

export default function GroupProposalForm(props: {
  initialValue: Partial<GroupProposal>
  communityId: string
  group: Group & { permalink: string }
  className?: string
}) {
  const router = useRouter()
  const [previewGroupProposal, setPreviewGroupProposal] = useAtom(
    previewGroupProposalAtom,
  )
  const groupProposal = previewGroupProposal || props.initialValue
  const methods = useForm<GroupProposal>({
    resolver: zodResolver(groupProposalSchema),
  })
  const {
    register,
    setValue,
    getValues,
    watch,
    reset,
    control,
    formState: { errors },
    handleSubmit: onSubmit,
  } = methods
  useEffect(() => {
    reset(groupProposal)
  }, [groupProposal, reset])
  const handleChoiceDelete = useCallback(
    (index: number) => {
      const choices = getValues('choices')?.filter((_, i) => i !== index)
      setValue('choices', choices && choices.length > 0 ? choices : [''])
    },
    [setValue, getValues],
  )
  useEffect(() => {
    if (props.group) {
      setValue('group', props.group.permalink)
    }
  }, [props.group, setValue])
  const [did, setDid] = useState('')
  const { data: snapshots } = useQuery(
    ['snapshots', did, props.group.permission],
    async () => {
      const requiredCoinTypes = uniq([
        ...(did ? [requiredCoinTypeOfDidChecker(did)] : []),
        ...requiredCoinTypesOfBooleanSets(props.group.permission.proposing),
        ...requiredCoinTypesOfDecimalSets(props.group.permission.voting),
      ])
      const snapshots = await pMap(requiredCoinTypes, getCurrentSnapshot, {
        concurrency: 5,
      })
      return snapshots.reduce((obj, snapshot, index) => {
        obj[requiredCoinTypes[index]] = snapshot.toString()
        return obj
      }, {} as { [coinType: string]: string })
    },
    { refetchInterval: 30000 },
  )
  const { account, connect } = useWallet()
  const { data: dids } = useDids(account)
  const { data: disables } = useQuery(
    [dids, props.group.permission],
    async () => {
      const requiredCoinTypes = uniq([
        ...(did ? [requiredCoinTypeOfDidChecker(did)] : []),
        ...requiredCoinTypesOfBooleanSets(props.group.permission.proposing),
        ...requiredCoinTypesOfDecimalSets(props.group.permission.voting),
      ])
      const snapshots = await pMap(requiredCoinTypes, getCurrentSnapshot, {
        concurrency: 5,
      })
      const booleans = await pMap(
        dids!,
        (did) => checkBoolean(props.group.permission.proposing, did, snapshots),
        { concurrency: 5 },
      )
      return dids!.reduce((obj, did, index) => {
        obj[did] = !booleans[index]
        return obj
      }, {} as { [key: string]: boolean })
    },
    { enabled: !!dids },
  )
  const didOptions = useMemo(
    () =>
      disables
        ? dids?.map((did) => ({ did, disabled: disables[did] }))
        : undefined,
    [dids, disables],
  )
  const defaultDid = useMemo(
    () => didOptions?.find(({ disabled }) => !disabled)?.did,
    [didOptions],
  )
  useEffect(() => {
    setDid(defaultDid || '')
  }, [defaultDid])
  useEffect(() => {
    if (snapshots) {
      setValue('snapshots', snapshots)
    }
  }, [setValue, snapshots])
  const { data: status } = useStatus(props.group.permalink)
  const choices = watch('choices') || []
  const disabled = useMemo(
    () => !status?.timestamp || !did || !snapshots,
    [did, snapshots, status?.timestamp],
  )
  const votingTypes = useMemo(
    () => [
      {
        value: 'single',
        name: 'Single choice',
        description: 'Choose only one choice',
      },
      {
        value: 'approval',
        name: 'Approval',
        description: 'Approve a certain number of choices',
      },
    ],
    [],
  )

  return (
    <Form
      title={`New proposal for ${props.group.name}`}
      className={props.className}
    >
      <FormSection title="Proposer" description="Author of the proposal.">
        <Grid6>
          <GridItem2>
            <FormItem>
              <DidCombobox
                top
                options={didOptions}
                value={did}
                onChange={setDid}
                onClick={connect}
              />
              {!defaultDid && props.group ? (
                <Slide
                  title={`Proposers of ${props.group.name}`}
                  trigger={({ handleOpen }) => (
                    <TextButton secondary onClick={handleOpen}>
                      Why I&#39;m not eligible to propose?
                    </TextButton>
                  )}
                >
                  {() =>
                    props.group ? (
                      <PermissionCard
                        title="Proposers"
                        description="SubDIDs who can initiate proposals in this workgroup."
                        value={props.group.permission.proposing}
                      />
                    ) : null
                  }
                </Slide>
              ) : null}
            </FormItem>
          </GridItem2>
        </Grid6>
      </FormSection>
      <FormSection
        title="Proposal"
        description="Proposals that include a concise title and detailed content are more likely to capture member's attention."
      >
        <Grid6>
          <GridItem6>
            <FormItem label="Title" error={errors.title?.message}>
              <TextInput
                {...register('title')}
                disabled={disabled}
                error={!!errors.title?.message}
              />
            </FormItem>
          </GridItem6>
          <GridItem6>
            <FormItem
              label="Content"
              description="Markdown is supported."
              error={errors?.content?.message}
            >
              <Textarea
                {...register('content')}
                disabled={disabled}
                error={!!errors?.content?.message}
              />
            </FormItem>
          </GridItem6>
        </Grid6>
      </FormSection>
      <FormSection title="Voting config">
        <Grid6>
          <GridItem6>
            <FormItem label="Voting type" error={errors.voting_type?.message}>
              <Controller
                control={control}
                name="voting_type"
                render={({ field: { value, onChange } }) => (
                  <RadioGroup2
                    options={votingTypes}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                  />
                )}
              />
            </FormItem>
          </GridItem6>
          <GridItem6>
            <FormItem
              label="Options"
              error={
                errors.choices?.message ||
                errors.choices?.find?.((choice) => choice?.message)?.message
              }
            >
              <div className="space-y-[-1px]">
                {choices.map((_, index) => (
                  <div
                    key={index}
                    className="relative flex items-center justify-between text-sm"
                  >
                    <input
                      type="text"
                      placeholder={`Choice ${index + 1}`}
                      {...register(`choices.${index}`)}
                      disabled={disabled}
                      className={clsx(
                        'peer block w-full border-gray-200 py-3 pl-3 focus:z-10 focus:border-primary-500 focus:ring-primary-300 disabled:cursor-not-allowed disabled:bg-gray-50 checked:disabled:bg-primary-600 sm:text-sm',
                        choices.length > 1 ? 'pr-20' : 'pr-3',
                        index === 0 ? 'rounded-t-md' : undefined,
                        index === choices.length - 1
                          ? 'rounded-b-md'
                          : undefined,
                      )}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 peer-focus:z-10">
                      {choices.length > 2 ? (
                        <ChoiceRemove
                          index={index}
                          onDelete={handleChoiceDelete}
                        />
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              {disabled ? null : (
                <Button
                  onClick={() => {
                    setValue('choices', [...choices, ''])
                  }}
                  className="mt-4"
                >
                  Add
                </Button>
              )}
            </FormItem>
          </GridItem6>
        </Grid6>
      </FormSection>
      <div className="flex w-full flex-col items-end space-y-6">
        <Button
          primary
          icon={EyeIcon}
          disabled={disabled}
          onClick={onSubmit((value) => {
            setPreviewGroupProposal({
              ...value,
              preview: {
                from: `/${props.communityId}/group/${props.group.id}/create`,
                to: `/${props.communityId}/group/${props.group.id}/proposal/${previewPermalink}`,
                template: `You are creating proposal on Voty\n\nhash:\n{sha256}`,
                author: did,
              },
            })
            router.push(
              `/${props.communityId}/group/${props.group.id}/proposal/${previewPermalink}`,
            )
          }, console.error)}
        >
          Preview
        </Button>
      </div>
    </Form>
  )
}

function ChoiceRemove(props: {
  index: number
  onDelete: (index: number) => void
}) {
  const { onDelete } = props
  const handleDelete = useCallback(() => {
    onDelete(props.index)
  }, [onDelete, props.index])

  return (
    <TextButton secondary onClick={handleDelete}>
      Remove
    </TextButton>
  )
}
