import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { EyeIcon } from '@heroicons/react/20/solid'
import pMap from 'p-map'
import { uniq } from 'lodash-es'
import { useRouter } from 'next/router'
import { useAtom } from 'jotai'

import useStatus from '../hooks/use-status'
import { getPhase, Phase } from '../utils/phase'
import { Proposal } from '../utils/schemas/proposal'
import { Grant } from '../utils/schemas/group'
import useWallet from '../hooks/use-wallet'
import useDids from '../hooks/use-dids'
import DidCombobox from './did-combobox'
import Button from './basic/button'
import TextButton from './basic/text-button'
import { Option, optionSchema } from '../utils/schemas/option'
import { Form, FormItem, FormSection } from './basic/form'
import { Grid6, GridItem6 } from './basic/grid'
import TextInput from './basic/text-input'
import Textarea from './basic/textarea'
import { requiredCoinTypeOfDidChecker } from '../utils/did'
import {
  checkBoolean,
  requiredCoinTypesOfBooleanSets,
} from '../utils/functions/boolean'
import { getCurrentSnapshot } from '../utils/snapshot'
import Tooltip from './basic/tooltip'
import { previewOptionAtom } from '../utils/atoms'
import { permalink2Id } from '../utils/permalink'
import { previewPermalink } from '../utils/constants'
import Slide from './basic/slide'
import RulesView from './rules-view'

export default function OptionForm(props: {
  entry?: string
  proposal?: Proposal & { permalink: string }
  group?: Grant
  className?: string
}) {
  const router = useRouter()
  const [did, setDid] = useState('')
  const { account, connect } = useWallet()
  const { data: dids } = useDids(account, props.proposal?.snapshots)
  const methods = useForm<Option>({
    resolver: zodResolver(optionSchema),
  })
  const {
    register,
    setValue,
    reset,
    formState: { errors },
    handleSubmit: onSubmit,
  } = methods
  const [previewOption, setPreviewOption] = useAtom(previewOptionAtom)
  useEffect(() => {
    reset(previewOption)
  }, [previewOption, reset])
  useEffect(() => {
    if (props.proposal?.permalink) {
      setValue('proposal', props.proposal.permalink)
    }
  }, [props.proposal?.permalink, setValue])
  const { data: status } = useStatus(props.proposal?.permalink)
  const phase = useMemo(
    () => getPhase(new Date(), status?.timestamp, props.group?.duration),
    [props.group?.duration, status?.timestamp],
  )
  const { data: disables } = useQuery(
    [dids, props.group?.permission.adding_option],
    async () => {
      const requiredCoinTypes = uniq([
        ...(did ? [requiredCoinTypeOfDidChecker(did)] : []),
        ...requiredCoinTypesOfBooleanSets(
          props.group!.permission.adding_option!,
        ),
      ])
      const snapshots = await pMap(requiredCoinTypes!, getCurrentSnapshot, {
        concurrency: 5,
      })
      const booleans = await pMap(
        dids!,
        (did) =>
          checkBoolean(props.group!.permission.adding_option, did, snapshots!),
        { concurrency: 5 },
      )
      return dids!.reduce((obj, did, index) => {
        obj[did] = !booleans[index]
        return obj
      }, {} as { [key: string]: boolean })
    },
    { enabled: !!dids && !!props.group },
  )
  const didOptions = useMemo(
    () =>
      disables
        ? dids
            ?.map((did) => ({ did, disabled: disables[did] }))
            .filter(({ disabled }) => !disabled)
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
  const disabled = !did

  return (
    <>
      <Form title="New proposal" className={props.className}>
        <FormSection>
          <Grid6 className="mt-6">
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
                description="Markdown is supported"
                error={errors.extension?.content?.message}
              >
                <Textarea
                  {...register('extension.content')}
                  disabled={disabled}
                  error={!!errors.extension?.content?.message}
                />
              </FormItem>
            </GridItem6>
          </Grid6>
        </FormSection>
      </Form>
      <div>
        {phase === Phase.ENDED ? null : (
          <div className="mt-6 flex w-full flex-col items-end">
            <div className="w-full flex-1 sm:w-64 sm:flex-none">
              <DidCombobox
                top
                label="Select a DID as proposer"
                options={didOptions}
                value={did}
                onChange={setDid}
                onClick={connect}
              />
              {didOptions?.length === 0 && props.group ? (
                <Slide
                  title={`Rules of ${props.group.name}`}
                  trigger={({ handleOpen }) => (
                    <TextButton secondary onClick={handleOpen}>
                      Why I&#39;m not eligible to propose
                    </TextButton>
                  )}
                >
                  {() =>
                    props.group ? (
                      <RulesView entry={props.entry} group={props.group} />
                    ) : null
                  }
                </Slide>
              ) : null}
            </div>
            {phase !== Phase.PROPOSING ? (
              <Tooltip
                place="left"
                text="Waiting for round confirming (in about 5 minutes)"
                className="mt-6"
              >
                <Button primary icon={EyeIcon} disabled>
                  Propose
                </Button>
              </Tooltip>
            ) : (
              <Button
                primary
                icon={EyeIcon}
                onClick={onSubmit((value) => {
                  if (!props.proposal) {
                    return
                  }
                  setPreviewOption({
                    ...value,
                    preview: {
                      from: `/round/${permalink2Id(
                        props.proposal.permalink,
                      )}/create`,
                      to: `/round/${permalink2Id(
                        props.proposal.permalink,
                      )}/${previewPermalink}`,
                      template: `You are proposing on Voty\n\nhash:\n{sha256}`,
                      author: did,
                    },
                  })
                  router.push(
                    `/round/${permalink2Id(
                      props.proposal.permalink,
                    )}/${previewPermalink}`,
                  )
                }, console.error)}
                disabled={disabled}
                className="mt-6"
              >
                Preview
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  )
}
