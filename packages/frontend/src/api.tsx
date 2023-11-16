export interface LoginForm {
  email: string
  password: string
}

export async function invite(
  { emailAddress }: { emailAddress: string },
  token?: string,
) {
  return betterFetch(
    'POST',
    'http://localhost:3000/api/invitation',
    { Cookie: `token=${token}` },
    { emailAddress },
  )
}

export async function submit(
  submission: {
    name: string
    dids: string[]
    logo_url: string
    domain: string
    role: string[]
    credentials: string[]
  },
  invitationId: string,
) {
  return betterFetch(
    'POST',
    `http://localhost:3000/api/submissions/${invitationId}`,
    {},
    submission,
  )
}

export async function getInvitation({
  invitationId,
}: {
  invitationId: string
}) {
  console.log(invitationId)
  return betterFetch(
    'GET',
    `http://localhost:3000/api/invitation/${invitationId}`,
  )
}

export async function logIn(credentials: LoginForm) {
  return betterFetch(
    'POST',
    'http://localhost:3000/api/auth/login',
    {},
    credentials,
  )
}

export async function logOut() {
  return betterFetch('GET', 'http://localhost:3000/api/auth/logout')
}

export async function getUser(token?: string) {
  try {
    if (!token) {
      return {}
    }
    const payload = await betterFetch(
      'GET',
      'http://localhost:3000/api/auth/whoami',
      { Cookie: `token=${token}` },
    )
    return payload
  } catch (error) {
    console.error(error)
    return {}
  }
}

export async function betterFetch<T>(
  method: 'GET' | 'POST',
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

export class FieldError extends Error {
  field: string
  constructor(message: string, field: string) {
    super(message)
    this.field = field
  }
}
