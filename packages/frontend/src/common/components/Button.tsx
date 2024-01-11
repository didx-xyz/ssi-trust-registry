import Link from 'next/link'
import React from 'react'

interface Props {
  type?: 'primary' | 'secondary'
  title: string
  loading?: boolean
}
interface LinkProps extends Props {
  href: string
  disabled?: never
  onClick?: never
}

interface ButtonProps extends Props {
  onClick: (param?: any) => void
  disabled?: boolean
  href?: never
}

const classes = {
  primary: 'btn-primary text-white',
  secondary: 'bg-medium',
}

export function Button({
  type = 'primary',
  title,
  href,
  onClick,
  loading,
  disabled,
}: LinkProps | ButtonProps) {
  const ParentComponent = href
    ? (props: any) => <Link {...props} href={href} />
    : (props: any) => (
        <button {...props} onClick={onClick} disabled={disabled} />
      )
  return (
    <ParentComponent
      className={`${classes[type]} btn normal-case px-4 py-3 w-48`}
    >
      {loading && <span className="loading loading-spinner"></span>}
      {title}
    </ParentComponent>
  )
}
