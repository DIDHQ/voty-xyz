import React, { useCallback } from 'react'
import MdEditor from 'react-markdown-editor-lite'
import clsx from 'clsx'
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
      markdownClass="focus:ring-0"
      className={clsx(
        'block w-full overflow-hidden rounded-md border placeholder:text-gray-400 disabled:cursor-not-allowed disabled:border-gray-200 disabled:bg-gray-50 disabled:text-gray-500 sm:text-sm',
        props.error
          ? 'border-red-300 text-red-900 placeholder:text-red-300 focus:border-red-500 focus:outline-none focus:ring-red-500'
          : 'border-gray-200 focus:border-primary-500 focus:ring-primary-300',
      )}
      placeholder="Markdown is supported"
    />
  )
}
