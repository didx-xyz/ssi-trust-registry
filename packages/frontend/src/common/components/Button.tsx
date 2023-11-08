import React from 'react'

interface Params {
  title: string
}

export function Button({ title }: Params) {
  return (
    <button className="btn bg-accent h-12 min-w-[192px] text-white normal-case hover:bg-accentHover">
      {title}
    </button>
  )
}
