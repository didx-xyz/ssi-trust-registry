'use client'
import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface Params {
  name: string
  href: string
}

const NavigationItem = ({ name, href }: Params) => {
  const currentRoute = usePathname()

  return (
    <Link
      href={href}
      className={'btn btn-sm normal-case h-[40px] rounded-lg border-0 px-4 hover:bg-lightHover' + (currentRoute !== href ? ' btn-ghost font-normal' : ' bg-light')}
    >
      {name}
    </Link>
  )
}

export default NavigationItem