import { useState, CSSProperties, useMemo } from 'react'
import { Button, Steps, Input } from 'react-daisyui'

import FormItem from '../components/form-item'
import { useRouter } from 'next/router'
import DidSelect from '../components/did-select'
import useConnectedSignatureUnit from '../hooks/use-connected-signature-unit'
import Link from 'next/link'

function useStep() {
  const router = useRouter()

  return useMemo(
    () =>
      [
        Number(router.query.steps || 0),
        () => {
          router.push(
            {
              query: {
                ...router.query,
                steps: String(Number(router.query.steps || 0) + 1),
              },
            },
            undefined,
            { shallow: true },
          )
        },
        () => {
          router.push(
            {
              query: {
                ...router.query,
                steps: String(Number(router.query.steps || 0) - 1),
              },
            },
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
  return (
    <Steps className="w-full mt-10 px-10">
      <Steps.Step color={value > 0 ? 'primary' : undefined}>
        Choose .bit Account
      </Steps.Step>
      <Steps.Step color={value > 1 ? 'primary' : undefined}>
        Basic Information
      </Steps.Step>
      <Steps.Step color={value > 2 ? 'primary' : undefined}>Done</Steps.Step>
    </Steps>
  )
}

function StepsPage() {
  const [step, handleNext, handlePrev] = useStep()
  const [did, setDid] = useState('')

  return (
    <>
      <CreateSteps value={step} />
      {step === 0 && <IntroPage onNext={handleNext} />}
      {step === 1 && (
        <ChooseAccount onNext={handleNext} value={did} onchange={setDid} />
      )}
      {step === 2 && <BasicInfo onPrev={handlePrev} onNext={handleNext} />}
      {step === 3 && <CreateSuccess value={did} />}
    </>
  )
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
        <Link
          className="text-primary"
          href="https://app.did.id/explorer"
          target="_blank"
        >
          Register Now
        </Link>
      </div>
    </div>
  )
}

function BasicInfo(props: { onPrev: () => void; onNext: () => void }) {
  const { onPrev, onNext } = props
  const [organizationName, setOrganizationName] = useState<string>('')
  const [desc, setDesc] = useState<string>('')

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
        <GreenCheck />
      </div>
      <h1 className="text-3xl md:text-4xl font-bold mb-3 mt-12 text-center">
        UnknownDAO is created successfully
      </h1>
      <Link
        href={`/${props.value}`}
        target="_self"
        className="hover:no-underline"
      >
        <Button color="primary" className="w-fit px-8 mt-16">
          Enter My Organization
        </Button>
      </Link>
    </div>
  )
}

function GreenCheck() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 117.72 117.72"
      style={
        {
          enableBackground: 'new 0 0 117.72 117.72',
        } as CSSProperties
      }
      xmlSpace="preserve"
    >
      <path
        d="M58.86 0c9.13 0 17.77 2.08 25.49 5.79-3.16 2.5-6.09 4.9-8.82 7.21a48.673 48.673 0 0 0-16.66-2.92c-13.47 0-25.67 5.46-34.49 14.29-8.83 8.83-14.29 21.02-14.29 34.49 0 13.47 5.46 25.66 14.29 34.49 8.83 8.83 21.02 14.29 34.49 14.29s25.67-5.46 34.49-14.29c8.83-8.83 14.29-21.02 14.29-34.49 0-3.2-.31-6.34-.9-9.37 2.53-3.3 5.12-6.59 7.77-9.85a58.762 58.762 0 0 1 3.21 19.22c0 16.25-6.59 30.97-17.24 41.62-10.65 10.65-25.37 17.24-41.62 17.24-16.25 0-30.97-6.59-41.62-17.24C6.59 89.83 0 75.11 0 58.86c0-16.25 6.59-30.97 17.24-41.62S42.61 0 58.86 0zM31.44 49.19 45.8 49l1.07.28c2.9 1.67 5.63 3.58 8.18 5.74a56.18 56.18 0 0 1 5.27 5.1c5.15-8.29 10.64-15.9 16.44-22.9a196.16 196.16 0 0 1 20.17-20.98l1.4-.54H114l-3.16 3.51C101.13 30 92.32 41.15 84.36 52.65a325.966 325.966 0 0 0-21.41 35.62l-1.97 3.8-1.81-3.87c-3.34-7.17-7.34-13.75-12.11-19.63-4.77-5.88-10.32-11.1-16.79-15.54l1.17-3.84z"
        style={{
          fill: '#01a601',
        }}
      />
    </svg>
  )
}

export default function CreateOrganization() {
  const [step, onNext] = useStep()

  return step === 0 ? <IntroPage onNext={onNext} /> : <StepsPage />
}
