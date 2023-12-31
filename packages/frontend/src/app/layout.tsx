import './globals.css'
import type { Metadata } from 'next'
import { PublicEnvScript } from 'next-runtime-env'
import { Roboto } from 'next/font/google'
import { Header } from '@/common/components/navigation/Header'

const roboto = Roboto({
  weight: ['400', '700'],
  style: ['normal'],
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Create Next App',
  description: 'Generated by create next app',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <PublicEnvScript />
      </head>
      <body
        className={
          roboto.className + ' min-h-screen h-fit bg-light text-primary'
        }
      >
        <Header />
        <main className="flex justify-center p-8">{children}</main>
      </body>
    </html>
  )
}
