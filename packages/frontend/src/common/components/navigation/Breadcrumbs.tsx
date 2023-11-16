'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export function NavigationBreadcrumbs({
  admin,
  rootName,
  rootHref,
}: {
  admin: boolean
  rootName: string
  rootHref: string
}) {
  const titles: Record<string, string | undefined> = {
    '/': 'Trusted Entities',
    schemas: 'Schemas',
    invite: 'Invite a company',
    submissions: admin ? 'Submissions' : undefined,
    'submissions/?': admin ? 'Review submission' : 'Submission form',
  }
  const paths = usePathname()
  const pathNames = paths.split('/').filter((path) => path)
  return (
    <div className="text-sm breadcrumbs self-start pb-8">
      <ul>
        <li>
          <Link href={rootHref}>{rootName}</Link>
        </li>
        {pathNames.length > 0}
        {pathNames.map((link, index) => {
          if (titles[link]) {
            let href = `/${pathNames.slice(0, index + 1).join('/')}`
            return (
              <li
                key={index}
                className={index === pathNames.length - 1 ? 'font-bold' : ''}
              >
                <Link href={href}>{titles[link]}</Link>
              </li>
            )
          }
          if (index > 0 && titles[`${pathNames[index - 1]}/?`]) {
            let href = `/${pathNames.slice(0, index + 1).join('/')}`
            return (
              <li
                key={index}
                className={index === pathNames.length - 1 ? 'font-bold' : ''}
              >
                <Link href={href}>{titles[`${pathNames[index - 1]}/?`]}</Link>
              </li>
            )
          }
          return null
        })}
      </ul>
    </div>
  )
}
