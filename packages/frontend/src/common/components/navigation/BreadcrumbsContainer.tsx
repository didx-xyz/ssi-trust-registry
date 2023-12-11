import { ReactNode } from 'react'

interface Props {
  children?: ReactNode
}

export function BreadcrumbsContainer({ children }: Props) {
  return (
    <div className="h-6 leading-6 text-sm breadcrumbs self-start p-0">
      {children}
    </div>
  )
}
