import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NavigationItem } from '@/common/components/navigation/NavigationItem'

export function Header() {
  return (
    <div className="sticky top-0 z-10 bg-white h-20 shadow-lg flex justify-between px-6 items-center">
      <Link href="/" className="flex gap-2">
        <Image
          src="/images/logo.svg"
          width={116}
          height={24}
          alt="Trust Registry"
        />
      </Link>
      <nav className="flex gap-4">
        <NavigationItem name="Trusted Entities" href="/" />
        <NavigationItem name="Schemas" href="/schemas" />
        <NavigationItem name="Submissions" href="/submissions" />
        <NavigationItem name="Login as Admin" href="/login" />
      </nav>
    </div>
  )
}
