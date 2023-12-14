import bcrypt from 'bcrypt'

async function main() {
  const password = 'password'
  const hash = await hashPassword(password)
  const match = await verifyPassword(password, hash)
  if (!match) throw new Error('Password verification failed.')
  console.log('hash', hash)
}

async function hashPassword(password: string) {
  return bcrypt.hash(password, 10)
}

async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash)
}

main()
