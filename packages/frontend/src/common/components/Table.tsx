import React, { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface CellProps {
  children: ReactNode
  className?: string
}

interface RowProps {
  children: ReactNode
  className?: string
  onClick?: () => void
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

export function TableRow({ children, className, onClick }: RowProps) {
  return (
    <tr
      className={`${className} ${onClick ? ' cursor-pointer group' : ''}`}
      onClick={onClick}
    >
      {children}
    </tr>
  )
}

export function TableCell({ children, className }: CellProps) {
  return (
    <td className="p-0 table-fixed break-all">
      <div
        className={`p-3.5 bg-white mb-1 w-full transition duration-300 border-y-2 border-white group-hover:border-medium ${
          className ? className : ''
        }`}
      >
        <div className="flex w-full leading-6 min-h-6 h-6 overflow-hidden">
          {children}
        </div>
      </div>
    </td>
  )
}
