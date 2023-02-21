import { useQuery } from '@tanstack/react-query'

import { didSuffixIs } from '../utils/did'
import dotbit from '../utils/sdks/dotbit'

export default function useAvatar(did?: string) {
  return useQuery(
    ['avatar', did],
    async () => {
      if (didSuffixIs(did!, 'bit')) {
        const avatar = await dotbit.account(did!).avatar()
        return avatar?.url || null
      }
    },
    { enabled: !!did, refetchOnWindowFocus: false },
  )
}
