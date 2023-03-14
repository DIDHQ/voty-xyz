import { useMemo } from 'react'

import { Community } from '../utils/schemas/community'

export default function useGroup(community?: Community | null, group?: string) {
  return useMemo(
    () => community?.groups?.find(({ id }) => id === group),
    [community?.groups, group],
  )
}
