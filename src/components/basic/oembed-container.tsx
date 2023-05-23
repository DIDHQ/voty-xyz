import { ReactNode, useMemo } from 'react'
import matchUrl from 'match-url-wildcard'
import { useQuery } from '@tanstack/react-query'
import { unified } from 'unified'
import rehypeParse from 'rehype-parse'
import rehypeReact from 'rehype-react'
import { createElement, Fragment } from 'react'

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
  const { data: oembed } = useQuery(
    ['oembed', endpoint?.url, props.link],
    () =>
      fetchJson<OembedDataSchema>(
        `${endpoint?.url}?url=${encodeURIComponent(props.link)}`,
      ),
    { enabled: !!endpoint, refetchOnWindowFocus: false },
  )
  const html = useMemo(
    () => (oembed && 'html' in oembed ? oembed.html : undefined),
    [oembed],
  )
  const { data: children } = useQuery(
    ['unified', html],
    () =>
      unified()
        .use(rehypeParse, { fragment: true })
        .use(rehypeReact, { createElement, Fragment })
        .process(html!),
    { enabled: !!html },
  )
  const aspectRatio = useMemo(
    () => (oembed && 'width' in oembed ? oembed.width / oembed.height : 1),
    [oembed],
  )

  return children?.result ? (
    <span style={{ aspectRatio }} className="block">
      {children.result}
    </span>
  ) : oembed?.type === 'photo' ? (
    <img
      src={oembed.url}
      style={{ width: oembed.width, height: oembed.height }}
      alt={oembed.title}
    />
  ) : (
    <>{props.fallback}</>
  )
}
