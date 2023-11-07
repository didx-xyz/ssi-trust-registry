import React, { ReactNode } from 'react'

interface Params {
  children: ReactNode
}

const PageHeading = ({ children }: Params) => {
  return (
    <div className='flex justify-between mb-6'>
      {children}
    </div>
  )
}

export default PageHeading