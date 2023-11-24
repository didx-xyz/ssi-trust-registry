'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Props {
  name: string
  href: string
}

export function NavigationItem({ name, href }: Props) {
  const currentRoute = usePathname()

  return (
    <Link
      href={href}
      prefetch={false}
      className={
        'btn btn-sm normal-case h-10 rounded-lg border-0 px-4 hover:bg-lightHover' +
        (currentRoute !== href ? ' btn-ghost font-normal' : ' bg-light')
      }
    >
      {name}
    </Link>
  )
}
