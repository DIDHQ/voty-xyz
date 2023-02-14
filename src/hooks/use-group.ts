import { useMemo } from 'react'

import { Community } from '../utils/schemas'

export default function useGroup(community?: Community, group?: string) {
  return useMemo(
    () => community?.groups?.find((g) => g.extension.id === group),
    [community?.groups, group],
  )
}
