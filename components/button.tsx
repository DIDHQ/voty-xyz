import clsx from 'clsx'

export type ButtonProps = {
  disabled?: boolean
  variant?: 'outline' | 'contained'
  size?: 'lg' | 'md' | 'sm' | 'xs'
  startIcon?: React.ReactNode
  fullWidth?: boolean
  type?: 'normal' | 'warning'
  children?: React.ReactNode
  loading?: boolean
}

function Button(props: ButtonProps) {
  const { disabled, size, variant, fullWidth, startIcon, loading, children } =
    props

  const cls = clsx({
    btn: true,
    'btn-block': fullWidth,
    'btn-outline': variant === 'outline',
    'btn-lg': size === 'lg',
    'btn-sm': size === 'sm',
    'btn-xs': size === 'xs',
    'gap-2': startIcon,
    loading: loading,
  })

  return (
    <button className={cls} disabled={disabled}>
      {!loading && startIcon}
      {loading ? 'loading' : children}
    </button>
  )
}

export default Button
