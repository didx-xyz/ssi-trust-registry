'use client'
import React, { ReactNode, useEffect, useState } from 'react'
import { getUser } from '@/api'
import { Unauthorized } from '@/common/components/auth/Unauthorized'

interface Props {
  children: ReactNode
}

interface User {
  id?: string
}

export function Protected({ children }: Props) {
  const [user, setUser] = useState<User>({})
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    getUser().then((user) => {
      if (user.id) {
        setUser(user)
      }
      setLoading(false)
    })
  }, [])

  if (isLoading) {
    return null
  }

  return user.id ? children : <Unauthorized />
}
