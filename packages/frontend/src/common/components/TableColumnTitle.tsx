import React from 'react'

interface Params {
  additionalTitleClasses?: string
  title: string
  partsOfTwelve: string
}

const TableColumnTitle = ({additionalTitleClasses = '', title, partsOfTwelve}: Params) => {
  return <th className={additionalTitleClasses + ' w-'+ partsOfTwelve +'/12 p-4'}>{title}</th>
}

export default TableColumnTitle