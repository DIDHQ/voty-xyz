import { toString } from 'mdast-util-to-string'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import { Root } from 'remark-parse/lib'
import { unified } from 'unified'
import { EXIT, visit } from 'unist-util-visit'

export function parseRoot(markdown?: string): Root | undefined {
  return markdown
    ? unified().use(remarkParse).use(remarkGfm).parse(markdown)
    : undefined
}

export function parseContent(root?: Root): string | undefined {
  return root
    ? toString(root, {
        includeImageAlt: false,
        includeHtml: false,
      })
    : undefined
}

export function parseImage(root?: Root): string | undefined {
  if (!root) {
    return undefined
  }
  let image: string | undefined
  visit(root, (node) => {
    if (node.type === 'image') {
      image = node.url
      return EXIT
    }
  })
  return image
}

export function parseImages(root?: Root): string[] {
  if (!root) {
    return []
  }
  const set = new Set<string>()
  visit(root, (node) => {
    if (node.type === 'image') {
      set.add(node.url)
    }
  })
  return Array.from(set.values())
}
