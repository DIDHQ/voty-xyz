import { useMutation } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import useSignDocument from '../hooks/use-sign-document'
import {
  previewCommunityAtom,
  previewGrantAtom,
  previewGrantProposalAtom,
  previewGroupAtom,
  previewGroupProposalAtom,
} from '../utils/atoms'
import {
  isCommunity,
  isGrant,
  isGrantProposal,
  isGroup,
  isGroupProposal,
} from '../utils/data-type'
import { trpc } from '../utils/trpc'
import { Preview } from '../utils/types'
import { previewPermalink } from '../utils/constants'
import { permalink2Id } from '../utils/permalink'
import sleep from '../utils/sleep'
import Button from './basic/button'
import Notification from './basic/notification'
import { Back } from './basic/back'

export default function PreviewBar() {
  const router = useRouter()
  const [previewCommunity, setPreviewCommunity] = useAtom(previewCommunityAtom)
  const [previewGrant, setPreviewGrant] = useAtom(previewGrantAtom)
  const [previewGrantProposal, setPreviewGrantProposal] = useAtom(
    previewGrantProposalAtom,
  )
  const [previewGroup, setPreviewGroup] = useAtom(previewGroupAtom)
  const [previewGroupProposal, setPreviewGroupProposal] = useAtom(
    previewGroupProposalAtom,
  )
  const document =
    previewCommunity ||
    previewGrant ||
    previewGrantProposal ||
    previewGroup ||
    previewGroupProposal
  const preview = document?.preview
  const { data: community } = trpc.community.getById.useQuery(
    { id: previewCommunity?.id },
    { enabled: !!previewCommunity?.id },
  )
  const utils = trpc.useContext()
  useEffect(() => {
    function handler(url: string) {
      if (preview && url !== preview.from && url !== preview.to) {
        setPreviewCommunity(undefined)
        setPreviewGrant(undefined)
        setPreviewGrantProposal(undefined)
        setPreviewGroup(undefined)
        setPreviewGroupProposal(undefined)
      }
    }
    router.events.on('routeChangeComplete', handler)
    return () => {
      router.events.off('routeChangeComplete', handler)
    }
  }, [
    router.events,
    preview,
    setPreviewCommunity,
    setPreviewGrant,
    setPreviewGrantProposal,
    setPreviewGroup,
    setPreviewGroupProposal,
  ])
  const signDocument = useSignDocument(
    preview?.author,
    preview?.template,
    preview?.snapshots,
  )
  const { mutateAsync: mutateCommunity } = trpc.community.create.useMutation()
  const { mutateAsync: mutateGrant } = trpc.grant.create.useMutation()
  const { mutateAsync: mutateGrantProposal } =
    trpc.grantProposal.create.useMutation()
  const { mutateAsync: mutateGroup } = trpc.group.create.useMutation()
  const { mutateAsync: mutateGroupProposal } =
    trpc.groupProposal.create.useMutation()
  const handleSubmit = useMutation<
    string,
    Error,
    object & { preview: Preview }
  >(async ({ preview, ...document }) => {
    if (isCommunity(document)) {
      const signed = await signDocument(document)
      await mutateCommunity(signed)
      await sleep(500)
      await Promise.all([
        utils.community.getById.refetch({ id: signed.id }),
        utils.groupProposal.list.refetch({
          communityId: signed.id,
          phase: undefined,
        }),
      ])
      setPreviewCommunity(undefined)
      router.push(`/${signed.id}`)
      return 'community'
    }
    if (isGrant(document)) {
      const signed = await signDocument(document)
      const permalink = await mutateGrant(signed)
      await sleep(500)
      await Promise.all([
        utils.grant.listByCommunityId.refetch({
          communityId: signed.authorship.author,
          phase: undefined,
        }),
      ])
      setPreviewGrant(undefined)
      router.push(
        `/${signed.authorship.author}/grant/${permalink2Id(permalink)}`,
      )
      return 'grant'
    }
    if (isGrantProposal(document)) {
      const signed = await signDocument(document)
      const permalink = await mutateGrantProposal(signed)
      await sleep(500)
      await Promise.all([
        utils.grantProposal.getByPermalink.refetch({ permalink }),
        utils.grant.getByPermalink.refetch({ permalink: signed.grant }),
      ])
      setPreviewGrantProposal(undefined)
      router.push(
        preview.to.replace(
          new RegExp(`\/${previewPermalink}\$`),
          `/${permalink2Id(permalink)}`,
        ),
      )
      return 'grant proposal'
    }
    if (isGroup(document)) {
      const signed = await signDocument(document)
      await mutateGroup(signed)
      await sleep(500)
      await Promise.all([
        utils.group.getById.refetch({
          communityId: signed.authorship.author,
          id: signed.id,
        }),
        utils.group.listByCommunityId.refetch({
          communityId: signed.authorship.author,
        }),
        utils.groupProposal.list.refetch({
          communityId: signed.authorship.author,
          groupId: signed.id,
          phase: undefined,
        }),
      ])
      setPreviewGroup(undefined)
      router.push(`/${signed.authorship.author}/group/${signed.id}`)
      return 'workgroup'
    }
    if (isGroupProposal(document)) {
      const signed = await signDocument(document)
      const permalink = await mutateGroupProposal(signed)
      await sleep(500)
      await Promise.all([
        utils.groupProposal.getByPermalink.refetch({ permalink }),
        utils.group.getByPermalink.refetch({ permalink: signed.group }),
      ])
      setPreviewGroupProposal(undefined)
      router.push(
        preview.to.replace(
          new RegExp(`\/${previewPermalink}\$`),
          `/${permalink2Id(permalink)}`,
        ),
      )
      return 'group proposal'
    }
    throw new Error('')
  })
  useEffect(() => {
    if (!preview) {
      return
    }
    const handleBeforeunload = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeunload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeunload)
    }
  }, [preview])

  return (
    <>
      <Notification type="error" show={handleSubmit.isError}>
        {handleSubmit.error?.message}
      </Notification>
      <Notification type="success" show={handleSubmit.isSuccess}>
        {handleSubmit.data
          ? `Your ${handleSubmit.data} has been submitted successfully`
          : 'Submitted successfully'}
      </Notification>

      {preview?.to === router.asPath ? (
        <div className="fixed bottom-0 w-full border-t border-base bg-white shadow-base pb-safe">
          <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between gap-4 px-3 md:px-6 lg:px-8">
            <Back href={preview.from} />

            <Button
              className="w-32"
              primary
              size="large"
              disabled={!preview}
              loading={handleSubmit.isLoading}
              onClick={() => (document ? handleSubmit.mutate(document) : null)}
            >
              {previewCommunity && community === null ? 'Import' : 'Submit'}
            </Button>
          </div>
        </div>
      ) : null}
    </>
  )
}
