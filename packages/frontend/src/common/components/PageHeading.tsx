import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function PageHeading({ children }: Props) {
  return (
    <div className="flex justify-between items-center mb-6 h-12">
      {children}
    </div>
  )
}
