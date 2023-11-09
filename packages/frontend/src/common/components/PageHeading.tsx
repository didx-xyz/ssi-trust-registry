import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function PageHeading({ children }: Props) {
  return <div className="flex justify-between mb-6">{children}</div>
}
