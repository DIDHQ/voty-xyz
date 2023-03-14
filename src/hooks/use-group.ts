import { useMemo } from 'react'

import { Community } from '../utils/schemas/community'
import { Grant, Group, Workgroup } from '../utils/schemas/group'

export default function useGroup<T extends Group['type']>(
  community?: Community | null,
  group?: string,
  type?: T,
) {
  return useMemo(
    () =>
      community?.groups
        ?.filter((group) => !type || (group.type || 'workgroup') === type)
        .find(({ id }) => id === group) as
        | (T extends 'workgroup'
            ? Workgroup
            : T extends 'grant'
            ? Grant
            : Group)
        | undefined,
    [community?.groups, group, type],
  )
}
