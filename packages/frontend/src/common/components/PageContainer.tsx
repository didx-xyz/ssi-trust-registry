import React, { ReactNode } from 'react'

interface Params {
  children: ReactNode
}

const PageContainer = ({ children }: Params) => {
  return (
    <div className='container'>
      {children}
    </div>
  )
}

export default PageContainer