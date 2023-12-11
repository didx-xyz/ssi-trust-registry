import React, { ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

export function AlignCenter({ children }: Props) {
  return (
    <div className="flex flex-col w-full items-center mt-8">{children}</div>
  )
}
