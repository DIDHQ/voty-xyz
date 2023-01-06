import React, { useState, useCallback, useEffect } from 'react'
import { DndContext, DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { nanoid } from 'nanoid'
import { Input, Button } from 'react-daisyui'
import { Drag } from '@icon-park/react'
import clsx from 'clsx'
import produce from 'immer'

function ChoiceListItem(props: {
  id: string
  value: string
  index: number
  disabled?: boolean
  onChange: (id: string, text: string) => void
  onDelete?: (id: string) => void
  onAdd?: () => void
}) {
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

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(id, e.target.value)
    },
    [id, onChange],
  )

  const handleDelete = useCallback(() => {
    onDelete && onDelete(id)
  }, [id, onDelete])

  const handleAdd = useCallback(() => {
    onAdd && onAdd()
  }, [onAdd])

  return (
    <div className="flex">
      <div
        className="relative mb-3 w-96"
        ref={setNodeRef}
        style={{
          opacity: isDragging ? 0.4 : undefined,
          transform: CSS.Translate.toString(transform),
          transition,
        }}
      >
        <Input
          className="pl-24 pr-16 w-full placeholder:opacity-50"
          value={value}
          onChange={handleChange}
          placeholder={index > 0 ? '(Optional)' : undefined}
          disabled={disabled}
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

  const handleChangeChoices = useCallback(
    (type: 'add' | 'delete' | 'modify', id?: string, text?: string) => {
      const newChoices = produce(value, (draft) => {
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
      setValue(newChoices)
      onChange(newChoices.map((newChoice) => newChoice.text))
    },
    [value, onChange],
  )

  const handleChange = useCallback(
    (id: string, text: string) => {
      handleChangeChoices('modify', id, text)
    },
    [handleChangeChoices],
  )

  const handleDelete = useCallback(
    (id: string) => {
      handleChangeChoices('delete', id)
    },
    [handleChangeChoices],
  )

  const handleAdd = useCallback(() => {
    handleChangeChoices('add')
  }, [handleChangeChoices])

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      const activeIndex = value.findIndex((choice) => choice.id === active.id)
      const overIndex = value.findIndex((choice) => choice.id === over?.id)
      const newChoices = arrayMove(value, activeIndex, overIndex)
      setValue(newChoices)
      onChange(newChoices.map((newChoice) => newChoice.text))
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
            value={choice.text}
            onChange={handleChange}
            index={index}
            disabled={props.disabled}
            onDelete={index < value.length - 1 ? handleDelete : undefined}
            onAdd={index === value.length - 1 ? handleAdd : undefined}
          />
        ))}
      </SortableContext>
    </DndContext>
  )
}
