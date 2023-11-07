import React from 'react'

interface Params {
  value: string
  additionalRowClasses?: string
}

const TableRow = ({ value, additionalRowClasses }: Params) => {
  return (
    <td className='p-0'>
      <div className={'p-4 bg-white mb-1 ' + additionalRowClasses}>
        <p className='leading-6 text-right'>{value || '-'}</p>
      </div>
    </td>
  );
};

export default TableRow