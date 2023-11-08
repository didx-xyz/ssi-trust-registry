import React, { ReactNode } from 'react'

interface Params {
  children: ReactNode
}

export function PageContainer({ children }: Params) {
  return <div className="container">{children}</div>
}
