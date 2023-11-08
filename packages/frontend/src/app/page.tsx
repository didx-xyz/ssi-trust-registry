import React from 'react'
import dayjs from 'dayjs'
import { Button } from '@/common/components/Button'
import Table, { TableDataConfigItem } from '@/common/components/Table'
import { PageHeading } from '@/common/components/PageHeading'
import { Text4xlBold } from '@/common/components/Typography'
import { TrustRegistry } from '@/common/interfaces'
import { Entity } from '@/common/interfaces'
import PageContainer from '@/common/components/PageContainer'

async function getData(): Promise<TrustRegistry> {
  const res = await fetch('http://localhost:3000/api/registry')

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.json()
}

export default async function Home() {
  const tableTitles: TableDataConfigItem[] = [
    {
      title: 'Company name',
      additionalTitleClasses: 'w-6/12',
      columnValue: 'name',
      cellType: 'icon',
    },
    {
      title: 'State',
      additionalTitleClasses: 'w-2/12 text-right',
      columnValue: 'status',
    },
    {
      title: 'Updated',
      additionalTitleClasses: 'w-2/12 text-right',
      columnValue: 'updatedAt',
    },
    {
      title: 'Registered',
      additionalTitleClasses: 'w-2/12 text-right',
      columnValue: 'createdAt',
    },
  ]
  const data: TrustRegistry = await getData()

  return (
    <PageContainer>
      <PageHeading>
        <Text4xlBold>Trusted Entities</Text4xlBold>
        <Button title="Invite a company" />
      </PageHeading>

      <Table
        tableDataConfig={tableTitles}
        items={data.entities.map((entity: Entity) => {
          return {
            ...entity,
            createdAt: dayjs(entity.createdAt).format('DD/MM/YYYY'),
            updatedAt: dayjs(entity.updatedAt).format('DD/MM/YYYY'),
          }
        })}
      />
    </PageContainer>
  )
}
