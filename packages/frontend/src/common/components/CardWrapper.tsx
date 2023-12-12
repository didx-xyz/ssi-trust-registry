import React, { ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

export function CardWrapper({ children }: Props) {
  return <div className="flex justify-center mt-8">{children}</div>
}
