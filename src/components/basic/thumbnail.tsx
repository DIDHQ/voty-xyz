import { isPermalink, permalink2Gateway } from '../../utils/permalink'
import { clsxMerge } from '@/src/utils/tailwind-helper'

export default function Thumbnail(props: { src?: string; className?: string }) {
  return props.src ? (
    <img
      src={isPermalink(props.src) ? permalink2Gateway(props.src) : props.src}
      alt={props.src}
      className={clsxMerge(
        'h-24 w-24 rounded-xl border object-cover object-center shrink-0 border-base',
        props.className,
      )}
    />
  ) : null
}
