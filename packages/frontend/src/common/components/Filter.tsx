import React, { ReactNode } from 'react'
import { TextSmBold } from '@/common/components/Typography'
import { PlusIcon } from '@/app/submissions/images/PlusIcon'

interface FilterProps {
  children: ReactNode
}

interface FilterButtonProps {
  onClick: any
  isActive: boolean
  value: string
}

export function Filter({ children }: FilterProps) {
  return (
    <div className="flex flex-col">
      <TextSmBold className="ml-4 h-6 mb-2">Filters</TextSmBold>
      <div className="flex gap-x-2 mb-6">{children}</div>
    </div>
  )
}

export function FilterButton({ onClick, isActive, value }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={
        'btn rounded-full min-h-0 h-10 text-sm normal-case transition ' +
        (isActive
          ? 'bg-primary hover:bg-primary text-white'
          : 'bg-white hover:bg-white text-primary')
      }
    >
      <PlusIcon
        className={
          'transition duration-500 ' +
          (isActive ? 'rotate-45 text-white' : 'text-primary')
        }
      />
      <p className="capitalize">{value}</p>
    </button>
  )
}
