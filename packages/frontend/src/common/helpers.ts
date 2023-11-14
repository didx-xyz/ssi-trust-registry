import { cookies } from 'next/headers'

export function getAuthToken() {
  const cookieStore = cookies()
  return cookieStore.get('token')?.value
}
