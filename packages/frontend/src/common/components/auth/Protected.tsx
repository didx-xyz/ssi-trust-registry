'use client'
import React, { ReactNode, useEffect, useState } from 'react'
import { getUser } from '@/api'
import { Unauthorized } from '@/common/components/auth/Unauthorized'

interface Props {
  children: ReactNode
}

interface User {
  id?: string
  message?: string
}

export function Protected({ children }: Props) {
  const [user, setUser] = useState<User>({})
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    async function getUserData() {
      const userData = await getUser()
      if (userData.id) {
        setUser(userData)
      }
      setLoading(false)
    }

    getUserData()
  }, [])

  if (isLoading) {
    return null
  }

  return user.id ? children : <Unauthorized />
}
