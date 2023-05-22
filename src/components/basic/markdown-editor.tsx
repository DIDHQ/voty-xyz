import React, { useCallback } from 'react'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'

import MarkdownViewer from './markdown-viewer'

export default function MarkdownEditor(props: {
  value: string
  onChange(value: string): void
  error?: boolean
  disabled?: boolean
}) {
  const { onChange } = props
  const handleEditorChange = useCallback(
    ({ text }: { text: string }) => {
      onChange(text)
    },
    [onChange],
  )

  return (
    <MdEditor
      value={props.value}
      onChange={handleEditorChange}
      readOnly={props.disabled}
      renderHTML={(text) => <MarkdownViewer>{text}</MarkdownViewer>}
      shortcuts={true}
      view={{ menu: true, md: true, html: false }}
      plugins={[
        'header',
        'font-bold',
        'font-italic',
        'font-underline',
        'font-strikethrough',
        'list-unordered',
        'list-ordered',
        'block-quote',
        'block-wrap',
        'block-code-inline',
        'block-code-block',
        'table',
        'image',
        'link',
        'logger',
        'mode-toggle',
        'full-screen',
        'tab-insert',
      ]}
      style={{ height: 600 }}
      htmlClass="prose"
      markdownClass="focus:ring-none focus:outline-none"
      placeholder="Markdown is supported"
    />
  )
}
