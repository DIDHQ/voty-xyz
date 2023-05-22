import { ReactNode, useMemo } from 'react'
import matchUrl from 'match-url-wildcard'
import { useQuery } from '@tanstack/react-query'

import providers from '../../utils/providers'
import { fetchJson } from '../../utils/fetcher'
import { OembedDataSchema } from '../../utils/schemas/oembed'

export default function OembedContainer(props: {
  link: string
  fallback: ReactNode
}) {
  const endpoint = useMemo(
    () =>
      providers
        .flatMap((provider) => provider.endpoints)
        .find(
          (endpoint) =>
            endpoint.url.startsWith('https') &&
            (!endpoint.formats || endpoint.formats.includes('json')) &&
            endpoint.schemes?.find((schema) => matchUrl(props.link, schema)),
        ),
    [props.link],
  )
  console.log('endpoint', endpoint)

  const { data } = useQuery(
    ['oembed', endpoint?.url, props.link],
    () =>
      fetchJson<OembedDataSchema>(
        `${endpoint?.url}?url=${encodeURIComponent(props.link)}`,
      ),
    { enabled: !!endpoint },
  )

  console.log(data)

  return data?.type === 'video' ? (
    <div
      dangerouslySetInnerHTML={{ __html: data.html }}
      style={{ width: data.width, height: data.height }}
    />
  ) : (
    props.fallback
  )
}
