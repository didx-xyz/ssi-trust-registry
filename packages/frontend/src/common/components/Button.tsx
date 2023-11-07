import React from 'react'

interface Params {
  name: string
}

const Button = ({ name }: Params) => {
  return (
    <button className="btn bg-accent h-[48px] min-w-[192px] text-white normal-case hover:bg-accentHover">
      {name}
    </button>
  )
}

export default Button