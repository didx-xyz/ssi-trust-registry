import React from 'react'
import { PageHeading } from '@/common/components/PageHeading'
import { Text4xlBold } from '@/common/components/Typography'
import { Schema } from '@/common/interfaces'
import dayjs from 'dayjs'
import { PageContainer } from '@/common/components/PageContainer'
import { betterFetch } from '@/api'

export default async function Schemas() {
  const schemas: Schema[] = await getSchemas()

  return (
    <PageContainer>
      <PageHeading>
        <Text4xlBold>Schemas</Text4xlBold>
      </PageHeading>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr className="text-sm text-primary">
              <th className="p-4 w-3/12">Name</th>
              <th className="p-4 w-5/12">Schema</th>
              <th className="p-4 w-2/12 text-right">Created</th>
              <th className="p-4 w-2/12 text-right">Updated</th>
            </tr>
          </thead>
          <tbody>
            {schemas.map((item: Schema, rowIndex: number) => {
              return (
                <tr key={rowIndex}>
                  <td className="p-0 table-fixed break-all">
                    <div className="flex p-4 bg-white mb-1 items-center rounded-l-lg">
                      <p className="leading-6 min-h-6 h-6 overflow-hidden">
                        {item.name}
                      </p>
                    </div>
                  </td>
                  <td className="p-0 table-fixed break-all">
                    <div className="p-4 bg-white mb-1">
                      <p className="leading-6 min-h-6 h-6 overflow-hidden">
                        {item.schemaId}
                      </p>
                    </div>
                  </td>
                  <td className="p-0 table-fixed break-all">
                    <div className="p-4 bg-white mb-1">
                      <p className="leading-6 min-h-6 h-6 overflow-hidden text-right">
                        {dayjs(item.createdAt).format('DD/MM/YYYY')}
                      </p>
                    </div>
                  </td>
                  <td className="p-0 table-fixed break-all">
                    <div className="p-4 bg-white mb-1 rounded-r-lg">
                      <p className="leading-6 min-h-6 h-6 overflow-hidden text-right">
                        {dayjs(item.updatedAt).format('DD/MM/YYYY')}
                      </p>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </PageContainer>
  )
}

async function getSchemas() {
  try {
    const response = await betterFetch(
      'GET',
      'http://localhost:3000/api/registry',
    )

    return response.schemas
  } catch (error) {
    return []
  }
}
