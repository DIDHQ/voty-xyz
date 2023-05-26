import { clsx } from 'clsx'

import { isPermalink, permalink2Gateway } from '../../utils/permalink'

export default function Thumbnail(props: { src?: string; className?: string }) {
  return props.src ? (
    <img
      src={isPermalink(props.src) ? permalink2Gateway(props.src) : props.src}
      alt={props.src}
      className={clsx(
        'h-[100px] w-[100px] rounded-md border object-cover object-center',
        props.className,
      )}
    />
  ) : null
}
