import React, { useCallback } from 'react'
import ReactMarkdown from 'react-markdown'
import MdEditor from 'react-markdown-editor-lite'
import 'react-markdown-editor-lite/lib/index.css'

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
      renderHTML={(text) => <ReactMarkdown>{text}</ReactMarkdown>}
      shortcuts={true}
      view={{ menu: true, md: true, html: false }}
      style={{ height: '500px' }}
    />
  )
}
