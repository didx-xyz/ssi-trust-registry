import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export function PageContainer({ children }: Props) {
  return <div className="container">{children}</div>
}
