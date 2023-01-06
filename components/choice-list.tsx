import React, { useState, useCallback, useEffect } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { nanoid } from 'nanoid'
import { Input, Button } from 'react-daisyui'
import { Drag, Minus, Plus } from '@icon-park/react'
import clsx from 'clsx'
import produce from 'immer'

function ChoiceListItem(props: {
  id: string
  disabled?: boolean
  value: string
  onChange: (id: string, text: string) => void
  onDelete?: (id: string) => void
  onAdd?: () => void
}) {
  const { id, disabled, value, onChange, onDelete, onAdd } = props

  const {
    attributes,
    isDragging,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id, disabled })

  const [text, setText] = useState('')

  useEffect(() => {
    setText(value)
  }, [value])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.target.value)
    },
    [setText],
  )

  const handleBlur = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(id, e.target.value)
    },
    [id, onChange],
  )

  const handleDelete = useCallback(() => {
    onDelete?.(id)
  }, [id, onDelete])

  return (
    <div
      ref={setNodeRef}
      className="flex"
      style={{
        opacity: isDragging ? 0.4 : undefined,
        transform: CSS.Translate.toString(transform),
        transition,
      }}
    >
      <div className="relative mb-3 w-96">
        <Input
          className="pl-6 w-full placeholder:opacity-50"
          disabled={disabled}
          value={text}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        <button
          className={clsx({
            'absolute left-1 top-1/4': true,
            'cursor-not-allowed': disabled,
          })}
          {...attributes}
          {...listeners}
          ref={setActivatorNodeRef}
        >
          <Drag />
        </button>
      </div>
      {onDelete && (
        <Button
          disabled={disabled}
          shape="circle"
          color="ghost"
          variant="outline"
          className="ml-3"
          onClick={handleDelete}
        >
          <Minus />
        </Button>
      )}
      {onAdd && (
        <Button
          disabled={disabled || !value}
          shape="circle"
          color="success"
          className="ml-3"
          onClick={onAdd}
        >
          <Plus />
        </Button>
      )}
    </div>
  )
}

export default function ChoiceList(props: {
  disabled?: boolean
  value: string[]
  onChange: (choices: string[]) => void
}) {
  const { onChange } = props

  const [value, setValue] = useState<{ id: string; text: string }[]>([])

  useEffect(() => {
    setValue(
      props.value.map((choice) => ({
        id: nanoid(),
        text: choice,
      })),
    )
  }, [props.value])

  const handleChange = useCallback(
    (id: string, text: string) => {
      onChange(value.map((choice) => (choice.id === id ? text : choice.text)))
    },
    [onChange, value],
  )

  const handleDelete = useCallback(
    (id: string) => {
      onChange(
        produce(value, (draft) => {
          const targetIndex = draft.findIndex((choice) => choice.id === id)
          draft.splice(targetIndex, 1)
        }).map(({ text }) => text),
      )
    },
    [onChange, value],
  )

  const handleAdd = useCallback(() => {
    onChange([...value.map(({ text }) => text), ''])
  }, [onChange, value])

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      const activeIndex = value.findIndex((choice) => choice.id === active.id)
      const overIndex = value.findIndex((choice) => choice.id === over?.id)
      onChange(arrayMove(value, activeIndex, overIndex).map(({ text }) => text))
    },
    [onChange, value],
  )

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <SortableContext items={value}>
        {value.map((choice, index) => (
          <ChoiceListItem
            key={choice.id}
            id={choice.id}
            disabled={props.disabled}
            value={choice.text}
            onChange={handleChange}
            onDelete={index < value.length - 1 ? handleDelete : undefined}
            onAdd={index === value.length - 1 ? handleAdd : undefined}
          />
        ))}
      </SortableContext>
    </DndContext>
  )
}
