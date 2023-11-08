import React from 'react'

interface Params {
  title: string
}

const Button = ({ title }: Params) => {
  return (
    <button className="btn bg-accent h-[48px] min-w-[192px] text-white normal-case hover:bg-accentHover">
      {title}
    </button>
  )
}

export default Button
