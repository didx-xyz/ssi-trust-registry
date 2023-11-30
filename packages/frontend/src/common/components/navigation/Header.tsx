'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NavigationItem } from '@/common/components/navigation/NavigationItem'
import { getUser, logOut } from '@/api'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

interface User {
  id?: string
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User>({})
  const protectedPages = ['/submissions', '/invitations', '/invitations/new']

  useEffect(() => {
    getUser().then((res) => {
      if (res.id) {
        setUser(res)
      }
    })
  }, [pathname])

  function logOutUser() {
    logOut()
    setUser({})
    redirectIfPageIsProtected()
  }

  function redirectIfPageIsProtected() {
    if (protectedPages.includes(pathname)) {
      router.push('/')
    }
  }

  function isPageHidden(pathname: string) {
    return protectedPages.includes(pathname) && !user.id
  }

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
        <NavigationItem
          href="/"
          name="Trusted Entities"
          hidden={isPageHidden('/')}
        />
        <NavigationItem
          href="/schemas"
          name="Schemas"
          hidden={isPageHidden('/schemas')}
        />
        <NavigationItem
          href="/submissions"
          name="Submissions"
          hidden={isPageHidden('/submissions')}
        />
        <NavigationItem
          href="/invitations"
          name="Invitations"
          hidden={isPageHidden('/invitations')}
        />
        {user.id ? (
          <button
            className="btn btn-sm normal-case h-10 rounded-lg border-0 px-4 hover:bg-lightHover btn-ghost font-normal"
            onClick={logOutUser}
          >
            Log Out
          </button>
        ) : (
          <NavigationItem name="Login as Admin" href="/login" />
        )}
      </nav>
    </div>
  )
}
