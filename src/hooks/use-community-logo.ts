import { useQuery } from '@tanstack/react-query'

export default function useCommunityLogo(permalink?: string) {
  return useQuery(
    ['logo', permalink],
    async () => {
      const response = await fetch(
        `/api/community-logo?permalink=${encodeURIComponent(permalink!)}`,
      )
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      return URL.createObjectURL(await response.blob())
    },
    { enabled: !!permalink },
  )
}
