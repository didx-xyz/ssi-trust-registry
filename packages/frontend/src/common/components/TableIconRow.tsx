import React from 'react'
import Image from 'next/image'

interface Params {
  value: string
  additionalRowClasses?: string
  logo: string
}

const TableIconRow = ({value, logo, additionalRowClasses}: Params) => {
  return <td className='p-0'>
    <div className={'flex p-4 bg-white mb-1 items-center ' + additionalRowClasses}>
      <Image className='mr-2' src={logo} alt={value} width={24} height={24}/>
      <p className='leading-6'>{value || '-'}</p>
    </div>
  </td>
}

export default TableIconRow