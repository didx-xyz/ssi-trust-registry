import React from 'react'

interface Props {
  children: string
  className?: string
}

export function Text4xlBold({ children }: Props) {
  return <h2 className="text-2xl font-bold">{children}</h2>
}

export function TextSmBold({ children }: Props) {
  return <p className="text-sm font-bold">{children}</p>
}
