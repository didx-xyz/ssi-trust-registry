export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const publicEnv = Object.fromEntries(
    Object.entries(process.env).filter(([key]) =>
      key.startsWith('NEXT_PUBLIC_'),
    ),
  )

  return Response.json(publicEnv, { status: 200 })
}
