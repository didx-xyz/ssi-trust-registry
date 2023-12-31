'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  name: string
  href: string
  hidden?: boolean
}

export function NavigationItem({ name, href, hidden }: Props) {
  const currentRoute = usePathname()

  return (
    !hidden && (
      <Link
        href={href}
        className={
          'btn btn-sm normal-case h-10 rounded-lg border-0 px-4 hover:bg-lightHover' +
          ((href === '/' ? href !== currentRoute : !currentRoute.includes(href))
            ? ' btn-ghost font-normal'
            : ' bg-light')
        }
      >
        {name}
      </Link>
    )
  )
}
