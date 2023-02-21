import { useRef, useEffect } from 'react'
import ReactTopLoadingBar, { LoadingBarRef } from 'react-top-loading-bar'

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
      color="#d97706"
      shadow={false}
      height={2}
      containerStyle={{ top: 'calc(4.5rem - 1.5px)' }}
    />
  )
}
