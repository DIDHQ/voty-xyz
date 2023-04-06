import { useMutation } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import useSignDocument from '../hooks/use-sign-document'
import { previewCommunityAtom, previewProposalAtom } from '../utils/atoms'
import { isCommunity, isProposal } from '../utils/data-type'
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
  const document = previewCommunity || previewProposal
  const preview = document?.preview
  const { data: community } = trpc.community.getByEntry.useQuery(
    { entry: previewCommunity?.preview.author },
    { enabled: !!previewCommunity?.preview.author },
  )
  const utils = trpc.useContext()
  useEffect(() => {
    function handler(url: string) {
      if (preview && url !== preview.from && url !== preview.to) {
        setPreviewCommunity(undefined)
        setPreviewProposal(undefined)
      }
    }
    router.events.on('routeChangeComplete', handler)
    return () => {
      router.events.off('routeChangeComplete', handler)
    }
  }, [router.events, preview, setPreviewCommunity, setPreviewProposal])
  const signDocument = useSignDocument(preview?.author, preview?.template)
  const { mutateAsync: mutateCommunity } = trpc.community.create.useMutation()
  const { mutateAsync: mutateProposal } = trpc.proposal.create.useMutation()
  const handleSubmit = useMutation<
    void,
    Error,
    object & { preview: Preview; group?: string }
  >(async ({ preview, ...document }) => {
    if (isCommunity(document)) {
      const signed = await signDocument(document)
      if (signed) {
        await mutateCommunity(signed)
        await Promise.all([
          utils.community.getByEntry.prefetch({
            entry: signed.authorship.author,
          }),
          utils.proposal.list.prefetch({
            entry: signed.authorship.author,
            group: document.group,
          }),
        ])
        setPreviewCommunity(undefined)
        router.push(
          document.group
            ? `/${signed.authorship.author}/${document.group}`
            : `/${signed.authorship.author}`,
        )
      }
    }
    if (isProposal(document)) {
      const signed = await signDocument(document)
      if (signed) {
        const permalink = await mutateProposal(signed)
        await Promise.all([
          utils.proposal.getByPermalink.prefetch({ permalink }),
          utils.community.getByPermalink.prefetch({
            permalink: signed.community,
          }),
        ])
        setPreviewProposal(undefined)
        router.push(
          preview.to.replace(
            new RegExp(`\/${previewPermalink}\$`),
            `/${permalink2Id(permalink)}`,
          ),
        )
      }
    }
  })

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
              {previewCommunity && community === null ? 'Import' : 'Submit'}
            </Button>
          </div>
        </footer>
      ) : null}
    </>
  )
}
