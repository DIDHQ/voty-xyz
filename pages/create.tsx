/* eslint-disable @next/next/no-img-element */

import { useState, useMemo } from 'react'
import Link from 'next/link'

import FormItem from '../components/form-item'
import DidSelect from '../components/did-select'
import useRouterQuery from '../hooks/use-router-query'
import useWallet from '../hooks/use-wallet'

function useStep() {
  const [query, setQuery] = useRouterQuery<['step']>()

  return useMemo(
    () =>
      [
        Number(query.step || 0),
        () => {
          setQuery('step', String(Number(query.step || 0) + 1), true)
        },
        () => {
          setQuery('step', String(Number(query.step || 0) - 1), true)
        },
      ] as [number, () => void, () => void],
    [query.step, setQuery],
  )
}

function IntroPage(props: { onNext(): void }) {
  const { onNext } = props

  return (
    <div className="hero bg-base-200 h-[calc(100vh_-_6rem)]">
      <div className="hero-content text-center">
        <div className="max-w-xl">
          <h1 className="text-5xl font-bold mb-3">Create an Organization</h1>
          <p className="py-6 mb-10 text-xl">
            Create your own organization now and start making decisions!
          </p>
          <button onClick={onNext}>Get Started</button>
        </div>
      </div>
    </div>
  )
}

function CreateSteps(props: { value: number }) {
  const { value } = props
  return value > 0 ? (
    <ol className="w-full mt-10 px-10">
      <li>Choose .bit Account</li>
      <li>Basic Information</li>
      <li>Done</li>
    </ol>
  ) : null
}

function ChooseAccount(props: {
  value: string
  onchange(value: string): void
  onNext: () => void
}) {
  const { onNext } = props
  const { account } = useWallet()

  return (
    <div className="flex flex-col justify-center items-center mt-20">
      <FormItem direction="horizontal" gap={3} label="Choose a .bit Account: ">
        <DidSelect
          account={account}
          value={props.value}
          onChange={props.onchange}
        />
      </FormItem>
      <button className="w-32 mt-10" disabled={!props.value} onClick={onNext}>
        Next
      </button>
      <div className="mt-10">
        I don&apos;t have an .bit account.{' '}
        <a className="text-primary" href="https://app.did.id/explorer">
          Register Now
        </a>
      </div>
    </div>
  )
}

function BasicInfo(props: { onPrev: () => void; onNext: () => void }) {
  const { onPrev, onNext } = props
  const [organizationName, setOrganizationName] = useState('')
  const [desc, setDesc] = useState('')
  // TODO: useForm

  return (
    <div className="flex flex-col justify-center items-center mt-20">
      <div className="flex flex-col items-end">
        <FormItem direction="horizontal" gap={3} label="Organization Name: ">
          <input
            className="w-96"
            placeholder={"What's the name of your organization?"}
            value={organizationName}
            onChange={(e) => setOrganizationName(e.target.value)}
          />
        </FormItem>
        <FormItem
          className="mt-10"
          direction="horizontal"
          gap={3}
          label="Description: "
        >
          <input
            className="w-96"
            placeholder={'What is the mission of your organization?'}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </FormItem>
      </div>
      <div className="flex gap-24 mt-28">
        <button className="w-32 mt-10" onClick={onPrev}>
          Previous
        </button>
        <button
          className="w-32 px-8 mt-10"
          disabled={!organizationName || !desc}
          onClick={onNext}
        >
          Next
        </button>
      </div>
    </div>
  )
}

function CreateSuccess(props: { value: string }) {
  return (
    <div className="flex justify-center flex-col items-center mt-32">
      <div className="w-20">
        <img src="/images/green-check.svg" alt="green-check" />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-3 mt-12 text-center">
        UnknownDAO is created successfully
      </h1>
      <Link href={`/${props.value}`}>
        <button className="w-fit px-8 mt-16">Enter My Organization</button>
      </Link>
    </div>
  )
}

export default function CreateOrganizationPage() {
  const [step, handleNext, handlePrev] = useStep()
  const [did, setDid] = useState('')

  return (
    <>
      <CreateSteps value={step} />
      {
        [
          <IntroPage key="0" onNext={handleNext} />,
          <ChooseAccount
            key="1"
            onNext={handleNext}
            value={did}
            onchange={setDid}
          />,
          <BasicInfo key="2" onPrev={handlePrev} onNext={handleNext} />,
          <CreateSuccess key="3" value={did} />,
        ][step]
      }
    </>
  )
}
