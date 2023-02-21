import { useRef, useEffect } from 'react'
import ReactTopLoadingBar, { LoadingBarRef } from 'react-top-loading-bar'
import { sky } from 'tailwindcss/colors'

export default function LoadingBar(props: { loading?: boolean }) {
  const ref = useRef<LoadingBarRef>(null)
  useEffect(() => {
    if (props.loading) {
      ref.current?.continuousStart()
    } else {
      ref.current?.complete()
    }
  }, [props.loading])

  return (
    <ReactTopLoadingBar
      ref={ref}
      color={sky['600']}
      shadow={false}
      height={2}
    />
  )
}
