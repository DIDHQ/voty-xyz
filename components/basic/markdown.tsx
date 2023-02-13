import Link from 'next/link'
import {
  defaultRules,
  ParserRules,
  parserFor,
  outputFor,
} from 'simple-markdown'

const rules: ParserRules = {
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
        <Link key={state.key} href={href}>
          {output((node as any).content, state)}
        </Link>
      ) : (
        <a key={state.key} href={href}>
          {output((node as any).content, state)}
        </a>
      )
    },
  },
}

const parser = parserFor(rules)

const output = outputFor(rules, 'react' as any)

export default function Markdown(props: { children: string | undefined }) {
  return <>{output(parser(`${props.children || ''}\n\n`, { inline: false }))}</>
}
