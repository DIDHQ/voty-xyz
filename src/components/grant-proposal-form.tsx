import { zodResolver } from '@hookform/resolvers/zod'
import pMap from 'p-map'
import { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { uniq } from 'lodash-es'
import { EyeIcon } from '@heroicons/react/20/solid'
import { useAtom } from 'jotai'
import { useRouter } from 'next/router'

import {
  GrantProposal,
  grantProposalSchema,
} from '../utils/schemas/v1/grant-proposal'
import { getCurrentSnapshot } from '../utils/snapshot'
import { requiredCoinTypeOfDidChecker } from '../utils/did'
import useStatus from '../hooks/use-status'
import { Grant } from '../utils/schemas/v1/grant'
import useWallet from '../hooks/use-wallet'
import useDids from '../hooks/use-dids'
import {
  checkBoolean,
  requiredCoinTypesOfBooleanSets,
} from '../utils/functions/boolean'
import { requiredCoinTypesOfDecimalSets } from '../utils/functions/decimal'
import { previewGrantProposalAtom } from '../utils/atoms'
import { previewPermalink } from '../utils/constants'
import { permalink2Id } from '../utils/permalink'
import { trpc } from '../utils/trpc'
import Slide from './basic/slide'
import PermissionCard from './permission-card'
import Button from './basic/button'
import DidCombobox from './did-combobox'
import { Grid6, GridItem2, GridItem6 } from './basic/grid'
import { Form, FormItem, FormSection } from './basic/form'
import TextButton from './basic/text-button'
import MarkdownEditor from './basic/markdown-editor'
import TextInput from './basic/text-input'

export default function GrantProposalForm(props: {
  initialValue: Partial<GrantProposal>
  communityId: string
  grantPermalink: string
  grant: Grant
  className?: string
}) {
  const router = useRouter()
  const [previewGrantProposal, setPreviewGrantProposal] = useAtom(
    previewGrantProposalAtom,
  )
  const grantProposal = previewGrantProposal || props.initialValue
  const methods = useForm<GrantProposal>({
    resolver: zodResolver(grantProposalSchema),
  })
  const {
    control,
    register,
    setValue,
    reset,
    formState: { errors },
    handleSubmit: onSubmit,
  } = methods
  useEffect(() => {
    reset(grantProposal)
    setValue('grant', props.grantPermalink)
  }, [grantProposal, props.grantPermalink, reset, setValue])
  const [did, setDid] = useState('')
  const { account, connect } = useWallet()
  const { data: dids } = useDids(account)
  const { data: proposed } = trpc.grantProposal.groupByProposer.useQuery(
    { grantPermalink: props.grantPermalink },
    { enabled: !!props.grantPermalink },
  )
  const { data: disables } = useQuery(
    [dids, props.grant.permission],
    async () => {
      const requiredCoinTypes = uniq([
        ...(did ? [requiredCoinTypeOfDidChecker(did)] : []),
        ...requiredCoinTypesOfBooleanSets(props.grant.permission.proposing),
        ...requiredCoinTypesOfDecimalSets(props.grant.permission.voting),
      ])
      const snapshots = await pMap(requiredCoinTypes, getCurrentSnapshot, {
        concurrency: 5,
      })
      const booleans = await pMap(
        dids!,
        (did) => checkBoolean(props.grant.permission.proposing, did, snapshots),
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
        ? dids
            ?.filter((did) => !disables[did])
            .map((did) => ({ did, disabled: proposed?.[did] }))
        : undefined,
    [dids, disables, proposed],
  )
  const defaultDid = useMemo(
    () => didOptions?.find(({ disabled }) => !disabled)?.did,
    [didOptions],
  )
  useEffect(() => {
    setDid(defaultDid || '')
  }, [defaultDid])

  const { data: status } = useStatus(props.grantPermalink)
  const disabled = useMemo(
    () => !status?.timestamp || !did,
    [did, status?.timestamp],
  )

  return (
    <Form
      title={`New proposal for ${props.grant.name}`}
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
              {!defaultDid && props.grant ? (
                <Slide
                  title={`Proposers of ${props.grant.name}`}
                  trigger={({ handleOpen }) => (
                    <TextButton
                      secondary
                      onClick={handleOpen}
                      className="text-sm"
                    >
                      Why I&#39;m not eligible to propose?
                    </TextButton>
                  )}
                >
                  {() =>
                    props.grant ? (
                      <PermissionCard
                        title="Proposers"
                        description="SubDIDs who can initiate proposals in this grant."
                        value={props.grant.permission.proposing}
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
            <FormItem label="Content" error={errors?.content?.message}>
              <Controller
                control={control}
                name="content"
                render={({ field: { value, onChange } }) => (
                  <MarkdownEditor
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                    error={!!errors?.content?.message}
                  />
                )}
              />
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
            setPreviewGrantProposal({
              ...value,
              preview: {
                from: `/${props.communityId}/grant/${permalink2Id(
                  props.grantPermalink,
                )}/create`,
                to: `/${props.communityId}/grant/${permalink2Id(
                  props.grantPermalink,
                )}/proposal/${previewPermalink}`,
                template: `You are creating proposal on Voty\n\nhash:\n{keccak256}`,
                author: did,
              },
            })
            router.push(
              `/${props.communityId}/grant/${permalink2Id(
                props.grantPermalink,
              )}/proposal/${previewPermalink}`,
            )
          }, console.error)}
        >
          Preview
        </Button>
      </div>
    </Form>
  )
}
