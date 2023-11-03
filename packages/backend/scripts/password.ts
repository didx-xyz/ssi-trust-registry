import bcrypt from 'bcrypt'

async function main() {
  const password = ''
  const hash = await hashPassword(password)
  const match = await verifyPassword(password, hash)
  if (!match) throw new Error('Password verification failed.')
  console.log('hash', hash)
}

async function hashPassword(password: string) {
  const hash = await bcrypt.hash(password, 10)
  return hash
}

async function verifyPassword(password: string, hash: string) {
  const match = await bcrypt.compare(password, hash)
  return match
}

main()
