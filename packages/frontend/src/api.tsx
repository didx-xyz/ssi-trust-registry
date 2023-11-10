export interface LoginForm {
  email: string
  password: string
}

export async function logIn(credentials: LoginForm) {
  return betterFetch<LoginForm>(
    'POST',
    'http://localhost:3000/api/auth/login',
    credentials,
  )
}

export async function logOut() {
  return betterFetch('GET', 'http://localhost:3000/api/auth/logout')
}

export async function getUser() {
  try {
    const payload = await betterFetch(
      'GET',
      'http://localhost:3000/api/auth/whoami',
    )
    return payload
  } catch (error) {
    console.error(error)
    return {}
  }
}

async function betterFetch<T>(
  method: 'GET' | 'POST',
  url: string,
  payload?: T,
) {
  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
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

  if (response.status < 200 || response.status > 299) {
    throw new Error(`${response.status} ${response.statusText}`)
  }

  return responsePayload
}
