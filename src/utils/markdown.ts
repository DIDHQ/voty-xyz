import { fromMarkdown } from 'mdast-util-from-markdown'
import { toString } from 'mdast-util-to-string'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { unified } from 'unified'
import { EXIT, visit } from 'unist-util-visit'

export function getSummary(markdown: string) {
  return (
    toString(fromMarkdown(markdown.substring(0, 300)), {
      includeImageAlt: false,
      includeHtml: false,
    }) || ' '
  )
}

export function getImage(markdown?: string): string | undefined {
  if (!markdown) {
    return undefined
  }
  const data = unified().use(remarkParse).use(remarkGfm).parse(markdown)
  let image: string | undefined
  visit(data, (node) => {
    if (node.type === 'image') {
      image = node.url
      return EXIT
    }
  })
  return image
}

export function getImages(markdown?: string): string[] {
  if (!markdown) {
    return []
  }
  const data = unified().use(remarkParse).use(remarkGfm).parse(markdown)
  const set = new Set<string>()
  visit(data, (node) => {
    if (node.type === 'image') {
      set.add(node.url)
    }
  })
  return Array.from(set.values())
}
