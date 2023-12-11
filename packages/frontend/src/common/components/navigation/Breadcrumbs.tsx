import Link from 'next/link'
import { BreadcrumbsContainer } from '@/common/components/navigation/BreadcrumbsContainer'

interface Props {
  breadcrumbs: Breadcrumb[]
}

type Breadcrumb = {
  href: string
  title: string
}

export function NavigationBreadcrumbs({ breadcrumbs }: Props) {
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
