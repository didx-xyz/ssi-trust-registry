import React from 'react'

interface Params {
  additionalTitleClasses?: string
  title: string
}

const TableColumnTitle = ({ additionalTitleClasses = '', title }: Params) => {
  return <th className={'p-4 ' + additionalTitleClasses}>{title}</th>
}

export default TableColumnTitle
