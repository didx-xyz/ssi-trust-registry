import Link from 'next/link'

interface Props {
  breadcrumbs: Breadcrumb[]
}

type Breadcrumb = {
  href: string
  title: string
}

export function NavigationBreadcrumbs({ breadcrumbs }: Props) {
  return (
    <div className="text-sm breadcrumbs self-start pb-8">
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
    </div>
  )
}
