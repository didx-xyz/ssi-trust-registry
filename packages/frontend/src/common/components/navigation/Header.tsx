'use client'
import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { NavigationItem } from '@/common/components/navigation/NavigationItem'
import { betterFetch, getUser, logOut } from '@/api'
import { usePathname } from 'next/navigation'
import { useRouter } from 'next/navigation'

interface User {
  id?: string
}

const protectedPages = ['/submissions', '/invitations', '/invitations/new']

export function Header() {
  const currentPathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState<User>({})
  const [pendingSubmissionsCount, setPendingSubmissionsCount] = useState(0)

  useEffect(() => {
    getUser().then((user) => {
      if (user.id) {
        setUser(user)
      }
    })
    getPendingSubmissionsCount().then(setPendingSubmissionsCount)
  }, [currentPathname])

  async function logOutUser() {
    try {
      await logOut()
      setUser({})
      redirectIfPageIsProtected()
    } catch (error) {
      console.log(error)
      if (error instanceof Error) {
        window.alert(error.message)
      }
    }
  }

  function redirectIfPageIsProtected() {
    if (isPageProtected(currentPathname)) {
      router.push('/')
    }
  }

  function isPageHidden(pathname: string) {
    return isPageProtected(pathname) && !user.id
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
          name={`Submissions (${pendingSubmissionsCount})`}
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

async function getPendingSubmissionsCount(): Promise<number> {
  try {
    const submissions = await betterFetch(
      'GET',
      'http://localhost:3000/api/submissions',
      {},
    )
    return submissions.filter(
      (submission: any) => submission.state === 'pending',
    ).length
  } catch (e) {
    console.error(e)
    return 0
  }
}

function isPageProtected(pathname: string) {
  return protectedPages.includes(pathname)
}
