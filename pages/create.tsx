/* eslint-disable @next/next/no-img-element */

import { useState, useMemo } from 'react'
import { Button, Steps, Input, Link } from 'react-daisyui'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import produce from 'immer'

import FormItem from '../components/form-item'
import DidSelect from '../components/did-select'
import useConnectedSignatureUnit from '../hooks/use-connected-signature-unit'

function useStep() {
  const router = useRouter()

  return useMemo(
    () =>
      [
        Number(router.query.step || 0),
        () => {
          router.push(
            produce(router, (draft) => {
              draft.query.step = String(Number(router.query.step || 0) + 1)
            }),
            undefined,
            { shallow: true },
          )
        },
        () => {
          router.push(
            produce(router, (draft) => {
              draft.query.step = String(Number(router.query.step || 0) - 1)
            }),
            undefined,
            { shallow: true },
          )
        },
      ] as [number, () => void, () => void],
    [router],
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
          <Button color="primary" onClick={onNext}>
            Get Started
          </Button>
        </div>
      </div>
    </div>
  )
}

function CreateSteps(props: { value: number }) {
  const { value } = props
  return value > 0 ? (
    <Steps className="w-full mt-10 px-10">
      <Steps.Step color={value > 0 ? 'primary' : undefined}>
        Choose .bit Account
      </Steps.Step>
      <Steps.Step color={value > 1 ? 'primary' : undefined}>
        Basic Information
      </Steps.Step>
      <Steps.Step color={value > 2 ? 'primary' : undefined}>Done</Steps.Step>
    </Steps>
  ) : null
}

function ChooseAccount(props: {
  value: string
  onchange(value: string): void
  onNext: () => void
}) {
  const { onNext } = props
  const connectedSignatureUnit = useConnectedSignatureUnit()

  return (
    <div className="flex flex-col justify-center items-center mt-20">
      <FormItem direction="horizontal" gap={3} label="Choose a .bit Account: ">
        <DidSelect
          signatureUnit={connectedSignatureUnit}
          value={props.value}
          onChange={props.onchange}
        />
      </FormItem>
      <Button
        className="w-32 mt-10"
        color="primary"
        disabled={!props.value}
        onClick={onNext}
      >
        Next
      </Button>
      <div className="mt-10">
        I don&apos;t have an .bit account.{' '}
        <Link className="text-primary" href="https://app.did.id/explorer">
          Register Now
        </Link>
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
          <Input
            className="w-96"
            placeholder={"What's the name of your organization?"}
            max={50}
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
          <Input
            className="w-96"
            placeholder={'What is the mission of your organization?'}
            max={120}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
        </FormItem>
      </div>
      <div className="flex gap-24 mt-28">
        <Button
          className="w-32 mt-10"
          color="ghost"
          variant="outline"
          onClick={onPrev}
        >
          Previous
        </Button>
        <Button
          className="w-32 px-8 mt-10"
          color="primary"
          disabled={!organizationName || !desc}
          onClick={onNext}
        >
          Next
        </Button>
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
      <NextLink href={`/${props.value}`}>
        <Button color="primary" className="w-fit px-8 mt-16">
          Enter My Organization
        </Button>
      </NextLink>
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
