import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
}
export function Table({ children }: Props) {
  return (
    <div className="overflow-x-auto">
      <table className="table">{children}</table>
    </div>
  )
}

export function TableHeader({ children }: Props) {
  return (
    <thead>
      <tr className="text-sm">{children}</tr>
    </thead>
  )
}

export function TableBody({ children }: Props) {
  return <tbody>{children}</tbody>
}
