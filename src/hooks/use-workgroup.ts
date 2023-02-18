import { useMemo } from 'react'

import { Community } from '../utils/schemas/community'

export default function useWorkgroup(
  community?: Community,
  workgroup?: string,
) {
  return useMemo(
    () => community?.workgroups?.find((g) => g.extension.id === workgroup),
    [community?.workgroups, workgroup],
  )
}
