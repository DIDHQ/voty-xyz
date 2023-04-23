import { useMutation } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import useSignDocument from '../hooks/use-sign-document'
import {
  previewCommunityAtom,
  previewGroupAtom,
  previewProposalAtom,
} from '../utils/atoms'
import { isCommunity, isGroup, isProposal } from '../utils/data-type'
import { trpc } from '../utils/trpc'
import { Preview } from '../utils/types'
import Button from './basic/button'
import Notification from './basic/notification'
import TextButton from './basic/text-button'
import { previewPermalink } from '../utils/constants'
import { permalink2Id } from '../utils/permalink'

export default function PreviewBar() {
  const router = useRouter()
  const [previewCommunity, setPreviewCommunity] = useAtom(previewCommunityAtom)
  const [previewGroup, setPreviewGroup] = useAtom(previewGroupAtom)
  const [previewProposal, setPreviewProposal] = useAtom(previewProposalAtom)
  const document = previewCommunity || previewGroup || previewProposal
  const preview = document?.preview
  const { data: community } = trpc.community.getById.useQuery(
    { id: previewCommunity?.preview.author },
    { enabled: !!previewCommunity?.preview.author },
  )
  const utils = trpc.useContext()
  useEffect(() => {
    function handler(url: string) {
      if (preview && url !== preview.from && url !== preview.to) {
        setPreviewCommunity(undefined)
        setPreviewGroup(undefined)
        setPreviewProposal(undefined)
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
    setPreviewProposal,
    setPreviewGroup,
  ])
  const signDocument = useSignDocument(preview?.author, preview?.template)
  const { mutateAsync: mutateCommunity } = trpc.community.create.useMutation()
  const { mutateAsync: mutateGroup } = trpc.group.create.useMutation()
  const { mutateAsync: mutateProposal } = trpc.proposal.create.useMutation()
  const handleSubmit = useMutation<
    string,
    Error,
    object & { preview: Preview }
  >(async ({ preview, ...document }) => {
    if (isCommunity(document)) {
      const signed = await signDocument(document)
      await mutateCommunity(signed)
      await Promise.all([
        utils.community.getById.prefetch({
          id: signed.authorship.author,
        }),
        utils.proposal.list.prefetch({
          community_id: signed.authorship.author,
          phase: undefined,
        }),
      ])
      setPreviewCommunity(undefined)
      router.push(`/${signed.authorship.author}`)
      return 'community'
    }
    if (isGroup(document)) {
      const signed = await signDocument(document)
      await mutateGroup(signed)
      await Promise.all([
        utils.group.getById.prefetch({
          community_id: signed.authorship.author,
          id: signed.id,
        }),
        utils.proposal.list.prefetch({
          community_id: signed.authorship.author,
          group_id: signed.id,
          phase: undefined,
        }),
      ])
      setPreviewGroup(undefined)
      router.push(`/${signed.authorship.author}/${signed.id}`)
      return 'workgroup'
    }
    if (isProposal(document)) {
      const signed = await signDocument(document)
      const permalink = await mutateProposal(signed)
      await Promise.all([
        utils.proposal.getByPermalink.prefetch({ permalink }),
        utils.group.getByPermalink.prefetch({ permalink: signed.group }),
      ])
      setPreviewProposal(undefined)
      router.push(
        preview.to.replace(
          new RegExp(`\/${previewPermalink}\$`),
          `/${permalink2Id(permalink)}`,
        ),
      )
      return 'proposal'
    }
    throw new Error('')
  })

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
        <footer className="fixed inset-x-0 bottom-0 h-18 border-t bg-primary-600 pb-safe">
          <div className="mx-auto flex h-18 max-w-5xl items-center justify-between px-6">
            <TextButton white href={preview.from}>
              ← Back
            </TextButton>
            <Button
              disabled={!preview}
              loading={handleSubmit.isLoading}
              onClick={() => (document ? handleSubmit.mutate(document) : null)}
            >
              {previewCommunity && community === null ? 'Import' : 'Submit'}
            </Button>
          </div>
        </footer>
      ) : null}
    </>
  )
}
