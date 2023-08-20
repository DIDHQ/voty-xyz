import { InputHTMLAttributes, ReactNode } from 'react'
import Card from './card'
import { clsxMerge } from '@/src/utils/tailwind-helper'

export function Form(props: {
  title: string
  description?: string
  className?: string
  children: ReactNode
}) {
  return (
    <div 
      className={clsxMerge(
        props.className
      )}>
      <div
        className="mb-6 text-center">
        <h2 
          className="text-display-xs-semibold text-strong">
          {props.title}
        </h2>
        
        {props.description ? (
          <p 
            className="mx-auto mt-2 max-w-2xl text-sm-regular text-subtle">
            {props.description}
          </p>
        ) : null}
      </div>
      
      {props.children}
    </div>
  )
}

export function FormSection(props: {
  title: string
  description?: string
  children: ReactNode
  className?: string
}) {
  return (
    <Card
      className={props.className}
      size="large">
      <div
        className="mb-6">
        <h3 
          className="text-xl-semibold text-strong">
          {props.title}
        </h3>
        
        {props.description ? (
          <p 
            className="mt-1 text-sm text-subtle">
            {props.description}
          </p>
        ) : null}
      </div>
      
      {props.children}
    </Card>
  )
}

export function FormFooter(props: { 
  className?: string
  children: ReactNode 
}) {
  return (
    <div 
      className={clsxMerge(
        'mt-8 flex justify-end gap-6',
        props.className
      )}>
      {props.children}
    </div>
  )
}

export function FormItem(
  props: {
    label?: string
    labelClassName?: string
    optional?: boolean
    description?: ReactNode
    error?: string
  } & InputHTMLAttributes<HTMLInputElement>,
) {
  const { label, labelClassName, optional, description, error, children, ...restProps } = props

  return (
    <div 
      {...restProps}>
      {label ? (
        <label 
          className={clsxMerge(
            'mb-2 block text-sm font-medium text-semistrong',
            labelClassName
          )}>
          {label}
          
          {optional ? (
            <span 
              className="ml-0.5 text-xs text-subtle">
              (optional)
            </span>
          ) : null}
        </label>
      ) : null}
      
      {children}
      
      {error ? (
        <p 
          className="mt-2 text-xs text-red-600">
          {error}
        </p>
      ) : null}
      
      {description ? (
        <p className="mt-2 text-sm text-subtle">{description}</p>
      ) : null}
    </div>
  )
}
