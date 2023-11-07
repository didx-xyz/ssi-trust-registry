import React from 'react'

interface Params {
  children: string
}

export const Text4xlBold = ({children}: Params) => {
  return (
    <h2 className='text-2xl font-bold'>{children}</h2>
  )
}
