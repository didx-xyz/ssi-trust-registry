import React from 'react'

interface Props {
  children: React.ReactNode
}

export function Card({ children }: Props) {
  return (
    <div className="card p-16 bg-white max-w-[40rem] w-full shadow-xl">
      {children}
    </div>
  )
}
