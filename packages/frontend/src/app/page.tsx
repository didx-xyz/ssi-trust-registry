import React from 'react'
import Button from '@/common/components/Button'
import Table, { TableDataConfigItem } from '@/common/components/Table'
import PageHeading from '@/common/components/PageHeading'
import { Text4xlBold } from '@/common/components/Typography'
import { TrustRegistry } from '@/common/interfaces/TrustRegistry'
import { TableCellType } from '@/common/enums/TableCellType'
import { Entity } from '@/common/interfaces/Entity'
import { formatDate } from '@/common/helpers'

async function getData(): Promise<TrustRegistry> {
  const res = await fetch('http://localhost:3000/api/registry')

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.json()
}

export default async function Home() {
  const tableTitles: TableDataConfigItem[] = [
    {title: 'Company name', partsOfTwelve: '6', columnValue: 'name', cellType: TableCellType.Icon},
    {title: 'State', partsOfTwelve: '2', additionalTitleClasses: 'text-right', columnValue: 'status'},
    {title: 'Updated', partsOfTwelve: '2', additionalTitleClasses: 'text-right', columnValue: 'updatedAt'},
    {title: 'Registered', partsOfTwelve: '2', additionalTitleClasses: 'text-right', columnValue: 'createdAt'}
  ]
  const data: TrustRegistry = await getData()

  return (
    <div className='container'>
      <PageHeading>
        <Text4xlBold>Trusted Entities</Text4xlBold>
        <Button name='Invite a company'/>
      </PageHeading>

      <Table
        tableDataConfig={tableTitles}
        items={data.entities.map((entity: Entity) => {
          return {
            ...entity,
            createdAt: formatDate(entity.createdAt),
            updatedAt: formatDate(entity.updatedAt)
          }
        })}
      />
    </div>
  )
}
