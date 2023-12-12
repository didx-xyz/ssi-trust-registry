import React, { ReactNode } from 'react'

interface Props {
  children: React.ReactNode
}

interface CardWrapperProps {
  children?: ReactNode
}

export function Card({ children }: Props) {
  return (
    <div className="card p-16 bg-white max-w-[40rem] w-full shadow-xl">
      {children}
    </div>
  )
}

export function CardWrapper({ children }: CardWrapperProps) {
  return <div className="flex justify-center mt-8">{children}</div>
}
