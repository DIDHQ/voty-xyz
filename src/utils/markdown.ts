import { fromMarkdown } from 'mdast-util-from-markdown'
import { toString } from 'mdast-util-to-string'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

export function getSummary(markdown: string) {
  return (
    toString(fromMarkdown(markdown), {
      includeImageAlt: false,
      includeHtml: false,
    }) || ' '
  )
}

export function getImages(markdown: string): string[] {
  const data = unified().use(remarkParse).use(remarkGfm).parse(markdown)
  const set = new Set<string>()
  visit(data, (node) => {
    if (node.type === 'image') {
      set.add(node.url)
    }
  })
  return Array.from(set.values())
}
