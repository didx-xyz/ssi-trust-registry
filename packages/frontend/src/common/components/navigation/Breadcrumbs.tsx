import { ReactNode } from 'react'
import Link from 'next/link'

interface NavigationBreadcrumbsProps {
  breadcrumbs: Breadcrumb[]
}

type Breadcrumb = {
  href: string
  title: string
}

interface BreadcrumbsContainerProps {
  children?: ReactNode
}

export function NavigationBreadcrumbs({
  breadcrumbs,
}: NavigationBreadcrumbsProps) {
  return (
    <BreadcrumbsContainer>
      <ul>
        {breadcrumbs.map(({ href, title }, index) => {
          return (
            <li
              key={href}
              className={index === breadcrumbs.length - 1 ? 'font-bold' : ''}
            >
              <Link href={href}>{title}</Link>
            </li>
          )
        })}
      </ul>
    </BreadcrumbsContainer>
  )
}

export function NavigationBreadcrumbsPlaceholder() {
  return <BreadcrumbsContainer />
}

function BreadcrumbsContainer({ children }: BreadcrumbsContainerProps) {
  return (
    <div className="h-6 leading-6 text-sm breadcrumbs self-start p-0">
      {children}
    </div>
  )
}
