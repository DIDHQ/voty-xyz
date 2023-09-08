import { useQuery } from '@tanstack/react-query'
import pMap from 'p-map'
import { indexBy, mapValues } from 'remeda'
import { hasEnabledSecondLevel } from '../utils/sdks/dotbit/second-level'

export function useEnabledSecondLevels(dids?: string[]) {
  return useQuery(['hasEnabledSecondLevels', dids], async () =>
    mapValues(
      indexBy(
        await pMap(dids ?? [], async (did) => ({
          did,
          enabled: await hasEnabledSecondLevel(did),
        })),
        ({ did }) => did,
      ),
      ({ enabled }) => enabled,
    ),
  )
}

export function useEnabledSecondLevel(did?: string) {
  return useQuery(
    ['hasEnabledSecondLevel', did],
    () => hasEnabledSecondLevel(did!),
    { enabled: !!did },
  )
}
