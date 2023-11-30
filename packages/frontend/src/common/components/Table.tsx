import React, { ReactNode } from 'react'
import dayjs from 'dayjs'

interface Props {
  children: ReactNode
  className?: string
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
      <tr className="text-sm text-primary">{children}</tr>
    </thead>
  )
}

export function TableBody({ children }: Props) {
  return <tbody>{children}</tbody>
}

export function TableCell({ children, className }: Props) {
  return (
    <td className="p-0 table-fixed break-all">
      <div className={'p-4 bg-white mb-1 w-full ' + className}>
        <div className="flex w-full leading-6 min-h-6 h-6 overflow-hidden">
          {children}
        </div>
      </div>
    </td>
  )
}
