import React, { useMemo, useState, useCallback } from 'react'
import type { CSSProperties } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { nanoid } from 'nanoid'
import { Input, Button } from 'react-daisyui'
import { Drag } from '@icon-park/react'
import clsx from 'clsx'
import produce from 'immer'

type ChoiceListItemProps = {
  id: string
  value: string
  index: number
  disabled?: boolean
  onChange: (id: string, text: string) => void
  onDelete?: (id: string) => void
  onAdd?: () => void
}

function ChoiceListItem(props: ChoiceListItemProps) {
  const { id, value, index, disabled, onChange, onDelete, onAdd } = props

  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id, disabled })

  const style: CSSProperties = useMemo(
    () => ({
      opacity: isDragging ? 0.4 : undefined,
      transform: CSS.Translate.toString(transform),
      transition,
    }),
    [isDragging, transform, transition],
  )

  const dragBtnCls = clsx({
    'absolute left-1 top-1/4': true,
    'cursor-not-allowed': disabled,
  })

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(id, e.target.value)
    },
    [id, onChange],
  )

  const handleDelete = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onDelete && onDelete(id)
    },
    [id, onDelete],
  )

  const handleAdd = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onAdd && onAdd()
    },
    [onAdd],
  )

  return (
    <div className="flex">
      <div
        className="relative mb-3 w-96"
        ref={setNodeRef}
        style={style}
        key={id}
      >
        <Input
          className="pl-24 pr-16 w-full placeholder:opacity-50"
          value={value}
          onChange={handleChange}
          placeholder={index > 0 ? '(Optional)' : undefined}
          disabled={disabled}
        />
        <button
          className={dragBtnCls}
          {...attributes}
          {...listeners}
          ref={setActivatorNodeRef}
        >
          <Drag size="1rem" />
        </button>
        <span className="opacity-50 absolute left-6 top-1/4 pointer-events-none">
          Choice {index + 1}
        </span>
      </div>
      {!disabled && onDelete && (
        <Button className="ml-3" onClick={handleDelete}>
          -
        </Button>
      )}
      {!disabled && onAdd && (
        <Button className="ml-3" onClick={handleAdd}>
          +
        </Button>
      )}
    </div>
  )
}

export type ChoiceListProps = {
  disabled?: boolean
  defaultChoices?: Array<string>
  onChoicesChange: (choices: Array<string>) => void
}

export default function ChoiceList(props: ChoiceListProps) {
  const { defaultChoices = [''], onChoicesChange, disabled } = props

  const choiceData = useMemo(
    () =>
      defaultChoices.map((choice) => ({
        id: nanoid(),
        text: choice,
      })),
    [defaultChoices],
  )

  const [choices, setChoices] = useState(choiceData)

  const changeChoices = useCallback(
    (type: 'add' | 'delete' | 'modify', id?: string, text?: string) => {
      const newChoices = produce(choices, (draft) => {
        if (type === 'add') {
          draft.push({ id: nanoid(), text: '' })
          return
        }
        const targetIndex = draft.findIndex((choice) => choice.id === id)
        if (type === 'delete') {
          draft.splice(targetIndex, 1)
        } else {
          draft[targetIndex].text = text || ''
        }
      })
      setChoices(newChoices)
      onChoicesChange(newChoices.map((newChoice) => newChoice.text))
    },
    [choices, onChoicesChange],
  )

  const handleChange = useCallback(
    (id: string, text: string) => {
      changeChoices('modify', id, text)
    },
    [changeChoices],
  )

  const handleDelete = useCallback(
    (id: string) => {
      changeChoices('delete', id)
    },
    [changeChoices],
  )

  const handleAdd = useCallback(() => {
    changeChoices('add')
  }, [changeChoices])

  const handleDragEnd = useCallback(
    (dragEndProps: DragEndEvent) => {
      const { active, over } = dragEndProps
      const activeIndex = choices.findIndex((choice) => choice.id === active.id)
      const overIndex = choices.findIndex((choice) => choice.id === over?.id)
      const newChoices = arrayMove(choices, activeIndex, overIndex)
      setChoices(newChoices)
    },
    [choices],
  )

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={choices}>
        {choices.map((choice, index) => (
          <ChoiceListItem
            key={choice.id}
            id={choice.id}
            value={choice.text}
            onChange={handleChange}
            index={index}
            disabled={disabled}
            onDelete={index < choices.length - 1 ? handleDelete : undefined}
            onAdd={index === choices.length - 1 ? handleAdd : undefined}
          />
        ))}
      </SortableContext>
    </DndContext>
  )
}
