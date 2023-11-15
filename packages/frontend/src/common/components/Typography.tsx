import React from 'react'

interface Props {
  children: string
  className?: string
}

export function Text4xlBold({ children, className }: Props) {
  return <h2 className={'text-2xl font-bold ' + className}>{children}</h2>
}

export function TextSmBold({ children, className }: Props) {
  return <p className={'text-sm font-bold ' + className}>{children}</p>
}
