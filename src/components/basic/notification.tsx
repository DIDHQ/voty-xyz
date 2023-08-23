import { Fragment, ReactNode, useEffect, useState } from 'react'
import { Portal, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'
import TextButton from './text-button'

export default function Notification(props: {
  show: boolean
  type: 'success' | 'error'
  children: ReactNode
}) {
  const [show, setShow] = useState(props.show)
  useEffect(() => {
    setShow(!!props.show)
    const timer = setTimeout(() => {
      setShow(false)
    }, 5000)
    return () => {
      clearTimeout(timer)
    }
  }, [props.show])

  return (
    <Portal>
      <div
        aria-live="assertive"
        className="pointer-events-none fixed inset-0 z-50 flex items-end px-4 py-6 sm:items-start sm:p-6">
        <div 
          className="flex w-full flex-col items-center space-y-4 sm:items-end">
          <Transition
            show={show}
            as={Fragment}
            enter="transform ease-out duration-300 transition"
            enterFrom="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
            enterTo="translate-y-0 opacity-100 sm:translate-x-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0">
            <div 
              className="pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-xl border border-base/40 bg-white p-5 shadow-lg">
              <div 
                className="flex items-center gap-3">
                <div 
                  className="shrink-0">
                  {props.type === 'error' ? (
                    <ExclamationTriangleIcon 
                      className="h-6 w-6 text-red-400" />
                  ) : props.type === 'success' ? (
                    <CheckCircleIcon 
                      className="h-6 w-6 text-green-400" />
                  ) : null}
                </div>
                
                <div 
                  className="min-w-0 flex-1">
                  <p 
                    className="text-md-medium text-strong">
                    {props.type}
                  </p>
                  
                  <p 
                    className="text-sm-regular text-moderate">
                    {props.children}
                  </p>
                </div>
              </div>
              
              <TextButton
                className="absolute right-3 top-3"
                onClick={() => {
                  setShow(false)
                }}>
                <XMarkIcon 
                  className="h-5 w-5" />
              </TextButton>
            </div>
          </Transition>
        </div>
      </div>
    </Portal>
  )
}
