import React, { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { DndContext } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { nanoid } from 'nanoid'

export type ChoiceListProps = {
  sortable?: boolean
  defaultChoices?: Array<string>
  onChoicesChange?: (choices: Array<string>) => void
  maxLength?: number
}

function ChoiceListItem(props: { id: string; choice: string }) {
  const { id, choice } = props
  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id })

  const style: CSSProperties = {
    opacity: isDragging ? 0.4 : undefined,
    transform: CSS.Translate.toString(transform),
    transition,
  }

  return (
    <div
      className="w-32 flex justify-between"
      ref={setNodeRef}
      style={style}
      key={id}
    >
      {choice}
      <button {...attributes} {...listeners} ref={setActivatorNodeRef}>
        <svg viewBox="0 0 20 20" width="12">
          <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
        </svg>
      </button>
    </div>
  )
}

export default function ChoiceList(props: ChoiceListProps) {
  const { defaultChoices = [''] } = props
  const choiceData = useMemo(
    () =>
      defaultChoices.map((choice) => ({
        id: nanoid(),
        text: choice,
      })),
    [defaultChoices],
  )
  const [choices, setChoices] = useState(choiceData)
  return (
    <DndContext
      onDragEnd={(dragEndProps) => {
        const { active, over } = dragEndProps
        console.log('dragEndProps', dragEndProps)
        const activeIndex = choices.findIndex(
          (choice) => choice.id === active.id,
        )
        console.log('activeIndex', activeIndex)
        const overIndex = choices.findIndex((choice) => choice.id === over?.id)
        console.log('overIndex', overIndex)
        const newChoices = arrayMove(choices, activeIndex, overIndex)
        console.log('newChoices', newChoices)
        setChoices(newChoices)
        setTimeout(() => {
          console.log('choices', choices)
        }, 2000)
      }}
    >
      <SortableContext items={choices}>
        {choices.map((choice) => (
          <ChoiceListItem key={choice.id} id={choice.id} choice={choice.text} />
        ))}
      </SortableContext>
    </DndContext>
  )
}
