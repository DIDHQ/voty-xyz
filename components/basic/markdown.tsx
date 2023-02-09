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
}

const parser = parserFor(rules)

const output = outputFor(rules, 'react' as any)

export default function Markdown(props: { children: string | undefined }) {
  return <>{output(parser(`${props.children || ''}\n\n`, { inline: false }))}</>
}
