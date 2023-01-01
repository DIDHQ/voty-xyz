import { Workgroup } from '../src/schemas'

export default function WorkgroupForm(props: {
  value: Workgroup
  onChange(value: Workgroup): void
}) {
  return <>{props.value.id}</>
}
