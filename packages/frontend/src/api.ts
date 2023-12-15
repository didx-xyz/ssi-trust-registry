import { BaseError } from 'make-error'
import { env } from 'next-runtime-env'

export const backendUrl = env('NEXT_PUBLIC_BACKEND_URL')

export interface LoginForm {
  email: string
  password: string
}

export async function getInvitation({
  invitationId,
}: {
  invitationId: string
}) {
  console.log(invitationId)
  return betterFetch('GET', `${backendUrl}/api/invitations/${invitationId}`)
}

export async function logIn(credentials: LoginForm) {
  return betterFetch('POST', `${backendUrl}/api/auth/login`, {}, credentials)
}

export async function logOut() {
  return betterFetch('GET', `${backendUrl}/api/auth/logout`)
}

export async function getUser(token?: string) {
  try {
    const payload = await betterFetch('GET', `${backendUrl}/api/auth/whoami`, {
      Cookie: `token=${token}`,
    })
    return payload
  } catch (error) {
    console.error(error)
    return {}
  }
}

export async function betterFetch<T>(
  method: 'GET' | 'POST' | 'PUT',
  url: string,
  headers?: any,
  payload?: T,
) {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    credentials: 'include',
    cache: 'no-cache',
    body: payload && JSON.stringify(payload),
  })

  const responseContentType = response.headers.get('Content-Type')

  if (!responseContentType) {
    throw new Error('Content-Type header is missing.')
  }

  if (!responseContentType.startsWith('application/json')) {
    throw new Error(
      `Unsupported Content-Type '${responseContentType}'. Supported Content-Types are: 'application/json'.`,
    )
  }

  const responsePayload = await response.json()
  console.log('HTTP response: ', responsePayload)
  if (responsePayload.field) {
    throw new FieldError(responsePayload.error, responsePayload.field)
  }

  if (response.status < 200 || response.status > 299) {
    throw new Error(`${response.status} ${response.statusText}`)
  }

  return responsePayload
}

export class FieldError extends BaseError {
  field: string
  constructor(message: string, field: string) {
    super(message)
    this.field = field
  }
}
