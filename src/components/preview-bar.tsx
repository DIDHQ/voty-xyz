import { useMutation } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import useSignDocument from '../hooks/use-sign-document'
import {
  previewCommunityAtom,
  previewOptionAtom,
  previewProposalAtom,
} from '../utils/atoms'
import { isCommunity, isOption, isProposal } from '../utils/data-type'
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
  const [previewProposal, setPreviewProposal] = useAtom(previewProposalAtom)
  const [previewOption, setPreviewOption] = useAtom(previewOptionAtom)
  const document = previewCommunity || previewProposal || previewOption
  const preview = document?.preview
  useEffect(() => {
    function handler(url: string) {
      if (preview && url !== preview.from && url !== preview.to) {
        setPreviewCommunity(undefined)
        setPreviewProposal(undefined)
        setPreviewOption(undefined)
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
    setPreviewOption,
  ])
  const signDocument = useSignDocument(preview?.author, preview?.template)
  const { mutateAsync: mutateCommunity } = trpc.community.create.useMutation()
  const { mutateAsync: mutateProposal } = trpc.proposal.create.useMutation()
  const { mutateAsync: mutateOption } = trpc.option.create.useMutation()
  const handleSubmit = useMutation<void, Error, object & { preview: Preview }>(
    async ({ preview, ...document }) => {
      if (isCommunity(document)) {
        const signed = await signDocument(document)
        if (signed) {
          await mutateCommunity(signed)
          setPreviewCommunity(undefined)
          router.reload()
        }
      }
      if (isProposal(document)) {
        const signed = await signDocument(document)
        if (signed) {
          const permalink = await mutateProposal(signed)
          setPreviewProposal(undefined)
          router.push(
            preview.to.replace(
              new RegExp(`\/${previewPermalink}\$`),
              `/${permalink2Id(permalink)}`,
            ),
          )
        }
      }
      if (isOption(document)) {
        const signed = await signDocument(document)
        if (signed) {
          await mutateOption(signed)
          setPreviewOption(undefined)
          router.reload()
        }
      }
    },
  )

  return (
    <>
      <Notification show={handleSubmit.isError}>
        {handleSubmit.error?.message}
      </Notification>
      {preview?.to === router.asPath ? (
        <footer className="fixed inset-x-0 bottom-0 h-18 border-t bg-primary-500">
          <div className="mx-auto flex h-18 max-w-5xl items-center justify-between px-6">
            <TextButton white href={preview.from}>
              ← Back
            </TextButton>
            <Button
              disabled={!preview}
              loading={handleSubmit.isLoading}
              onClick={() => (document ? handleSubmit.mutate(document) : null)}
            >
              Submit
            </Button>
          </div>
        </footer>
      ) : null}
    </>
  )
}
