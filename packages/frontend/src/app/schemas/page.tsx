import React from 'react'
import { PageHeading } from '@/common/components/PageHeading'
import { Text2xlBold } from '@/common/components/Typography'
import { Schema } from '@/common/interfaces'
import dayjs from 'dayjs'
import { PageContainer } from '@/common/components/PageContainer'
import { backendUrl, betterFetch } from '@/api'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/common/components/Table'

export default async function Schemas() {
  const schemas: Schema[] = await getSchemas()

  return (
    <PageContainer>
      <PageHeading>
        <Text2xlBold>Schemas</Text2xlBold>
      </PageHeading>
      <Table>
        <TableHeader>
          <th className="p-4 w-3/12">Name</th>
          <th className="p-4 w-5/12">Schema</th>
          <th className="p-4 w-2/12 text-right">Created</th>
          <th className="p-4 w-2/12 text-right">Updated</th>
        </TableHeader>
        <TableBody>
          {schemas.map((item: Schema, rowIndex: number) => {
            return (
              <TableRow key={rowIndex}>
                <TableCell className="rounded-l-lg">
                  <p>{item.name}</p>
                </TableCell>
                <TableCell>
                  <p>{item.schemaId}</p>
                </TableCell>
                <TableCell>
                  <p className="text-right w-full">
                    {dayjs(item.createdAt).format('DD/MM/YYYY')}
                  </p>
                </TableCell>
                <TableCell className="rounded-r-lg">
                  <p className="text-right w-full">
                    {dayjs(item.updatedAt).format('DD/MM/YYYY')}
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

async function getSchemas() {
  try {
    const response = await betterFetch('GET', `${backendUrl}/api/registry`)

    return response.schemas
  } catch (error) {
    return []
  }
}
