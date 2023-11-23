import Link from 'next/link'
import React from 'react'

interface Props {
  type?: 'primary' | 'secondary'
  title: string
  loading?: boolean
}
interface LinkProps extends Props {
  href: string
  onClick?: never
}

interface ButtonProps extends Props {
  onClick: () => void
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
}: LinkProps | ButtonProps) {
  const ParentComponent = href
    ? (props: any) => <Link {...props} href={href} />
    : (props: any) => <button {...props} onClick={onClick} />
  return (
    <ParentComponent className={`${classes[type]} btn normal-case px-12`}>
      {loading && <span className="loading loading-spinner"></span>}
      {title}
    </ParentComponent>
  )
}
