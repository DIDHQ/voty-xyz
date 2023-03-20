import { useMutation } from '@tanstack/react-query'
import { useAtom } from 'jotai'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

import useSignDocument from '../hooks/use-sign-document'
import { previewCommunityAtom } from '../utils/atoms'
import { Community } from '../utils/schemas/community'
import { trpc } from '../utils/trpc'
import Button from './basic/button'
import Notification from './basic/notification'
import TextButton from './basic/text-button'

export default function PreviewBar() {
  const router = useRouter()
  const [previewCommunity, setPreviewCommunity] = useAtom(previewCommunityAtom)
  useEffect(() => {
    function handler(url: string) {
      if (previewCommunity && url !== previewCommunity.from) {
        setPreviewCommunity(undefined)
      }
    }
    router.events.on('routeChangeComplete', handler)
    return () => {
      router.events.off('routeChangeComplete', handler)
    }
  }, [previewCommunity, router.events, setPreviewCommunity])
  const signDocument = useSignDocument(
    previewCommunity?.author,
    previewCommunity?.template,
  )
  const { mutateAsync } = trpc.community.create.useMutation()
  const handleSubmit = useMutation<void, Error, Community>(
    async (community) => {
      const signed = await signDocument(community)
      if (signed) {
        await mutateAsync(signed)
        setPreviewCommunity(undefined)
        if (previewCommunity) {
          router.push(previewCommunity.to)
        }
      }
    },
  )

  return (
    <>
      <Notification show={handleSubmit.isError}>
        {handleSubmit.error?.message}
      </Notification>
      <footer className="fixed inset-x-0 bottom-0 h-18 border-t bg-primary-500">
        <div className="mx-auto flex h-18 max-w-5xl items-center justify-between px-6">
          <TextButton white href={previewCommunity?.from}>
            ← Back
          </TextButton>
          <Button
            disabled={!previewCommunity}
            loading={handleSubmit.isLoading}
            onClick={() =>
              previewCommunity ? handleSubmit.mutate(previewCommunity) : null
            }
          >
            Submit
          </Button>
        </div>
      </footer>
    </>
  )
}
