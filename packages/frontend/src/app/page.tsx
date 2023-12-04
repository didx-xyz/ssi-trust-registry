import React from 'react'
import Image from 'next/image'
import dayjs from 'dayjs'
import { PageHeading } from '@/common/components/PageHeading'
import { Text2xlBold } from '@/common/components/Typography'
import { Entity } from '@/common/interfaces'
import { PageContainer } from '@/common/components/PageContainer'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/common/components/Table'
import { backendUrl, betterFetch } from '@/api'

export default async function Home() {
  const entities: Entity[] = await getEntities()

  return (
    <PageContainer>
      <PageHeading>
        <Text2xlBold>Trusted Entities</Text2xlBold>
      </PageHeading>
      <Table>
        <TableHeader>
          <th className="p-4 w-8/12">Company name</th>
          <th className="p-4 w-2/12 text-right">Updated</th>
          <th className="p-4 w-2/12 text-right">Registered</th>
        </TableHeader>
        <TableBody>
          {entities.map((item: Entity, rowIndex: number) => {
            return (
              <TableRow key={rowIndex}>
                <TableCell className="rounded-l-lg border-l-2">
                  <Image
                    className="mr-2"
                    src={item.logo_url}
                    alt={item.name}
                    width={24}
                    height={24}
                  />
                  <p>{item.name}</p>
                </TableCell>
                <TableCell>
                  <p className="text-right w-full">
                    {dayjs(item.updatedAt).format('DD/MM/YYYY')}
                  </p>
                </TableCell>
                <TableCell className="rounded-r-lg border-r-2">
                  <p className="text-right w-full">
                    {dayjs(item.createdAt).format('DD/MM/YYYY')}
                  </p>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </PageContainer>
  )
}

async function getEntities() {
  try {
    const response = await betterFetch('GET', `${backendUrl}/api/registry`)
    return response.entities
  } catch (error) {
    return []
  }
}
