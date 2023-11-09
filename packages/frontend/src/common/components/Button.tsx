import React from 'react'

interface Props {
  title: string
}

export function Button({ title }: Props) {
  return (
    <button className="btn bg-accent h-12 min-w-[192px] text-white normal-case hover:bg-accentHover">
      {title}
    </button>
  )
}
