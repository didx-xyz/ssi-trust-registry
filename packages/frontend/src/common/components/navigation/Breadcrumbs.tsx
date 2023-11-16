'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

const titles: Record<string, string> = {
  '/': 'Trusted Entities',
  schemas: 'Schemas',
  invite: 'Invite a company',
  submission: 'Submissions',
  'submission/?': 'Submission Form',
}

export function NavigationBreadcrumbs({
  rootName,
  rootHref,
}: {
  rootName: string
  rootHref: string
}) {
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
          if (!titles[link]) return null
          if (index === pathNames.length - 2 && !titles[pathNames[index + 1]]) {
            let href = `/${pathNames.slice(0, index + 2).join('/')}`
            return (
              <li
                key={index}
                className={index === pathNames.length - 2 ? 'font-bold' : ''}
              >
                <Link href={href}>{titles[`${link}/?`]}</Link>
              </li>
            )
          } else {
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
        })}
      </ul>
    </div>
  )
}
