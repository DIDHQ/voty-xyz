import Link from 'next/link'
import { useMemo } from 'react'
import {
  defaultRules,
  ParserRules,
  parserFor,
  outputFor,
} from 'simple-markdown'

export default function Markdown(props: { children: string }) {
  const rules = useMemo<ParserRules>(
    () => ({
      ...defaultRules,
      paragraph: {
        ...defaultRules.paragraph,
        react: (node, output, state) => {
          return <p key={state.key}>{output((node as any).content, state)}</p>
        },
      },
      link: {
        ...defaultRules.link,
        react: (node, output, state) => {
          const href = (node as any).target
          return typeof href === 'string' &&
            (href.startsWith('/') || href.startsWith('#')) ? (
            <Link
              key={state.key}
              href={href}
              className="break-all text-secondary-600 no-underline hover:text-secondary-700"
            >
              {output((node as any).content, state)}
            </Link>
          ) : (
            <a
              key={state.key}
              href={href}
              className="break-all text-secondary-600 no-underline hover:text-secondary-700"
            >
              {output((node as any).content, state)}
            </a>
          )
        },
      },
    }),
    [],
  )
  const parser = useMemo(() => parserFor(rules), [rules])
  const output = useMemo(() => outputFor(rules, 'react' as any), [rules])

  return <>{output(parser(`${props.children || ''}\n\n`, { inline: false }))}</>
}
