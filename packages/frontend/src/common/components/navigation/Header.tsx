'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NavigationItem } from '@/common/components/navigation/NavigationItem'
import { getUser, logOut } from '@/api'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

interface Props {
  id?: string
  message?: string
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<Props>({})
  const protectedPages = ['/submissions', '/invitations', '/invitations/new']

  useEffect(() => {
    async function getUserData() {
      const userData = await getUser()
      setUser(userData)
    }

    getUserData()
  }, [pathname])

  function redirectIfPageIsProtected() {
    if (protectedPages.includes(pathname)) {
      router.push('/')
    }
  }

  function isPageProtected(url: string) {
    return protectedPages.includes(url) && !user.id
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
          hidden={isPageProtected('/')}
        />
        <NavigationItem
          href="/schemas"
          name="Schemas"
          hidden={isPageProtected('/schemas')}
        />
        <NavigationItem
          href="/submissions"
          name="Submissions"
          hidden={isPageProtected('/submissions')}
        />
        <NavigationItem
          href="/invitations"
          name="Invitations"
          hidden={isPageProtected('/invitations')}
        />
        {user.id ? (
          <button
            className="btn btn-sm normal-case h-10 rounded-lg border-0 px-4 hover:bg-lightHover btn-ghost font-normal"
            onClick={() => {
              logOut()
              setUser({})
              redirectIfPageIsProtected()
            }}
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
