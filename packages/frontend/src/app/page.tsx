import React from 'react'
import Image from 'next/image'
import dayjs from 'dayjs'
import { cookies } from 'next/headers'
import { Button } from '@/common/components/Button'
import { PageHeading } from '@/common/components/PageHeading'
import { Text4xlBold } from '@/common/components/Typography'
import { Entity } from '@/common/interfaces'
import { PageContainer } from '@/common/components/PageContainer'
import { Table, TableBody, TableHeader } from '@/common/components/Table'
import { betterFetch, getUser } from '@/api'

async function getEntities() {
  try {
    const response = await betterFetch(
      'GET',
      'http://localhost:3000/api/registry',
    )
    return response.entities
  } catch (error) {
    return []
  }
}

export default async function Home() {
  const entities: Entity[] = await getEntities()
  const token = getAuthToken()
  const user = await getUser(token)
  console.log('user', user)

  return (
    <PageContainer>
      <PageHeading>
        <Text4xlBold>Trusted Entities</Text4xlBold>
        {user.id && <Button title="Invite a company" />}
      </PageHeading>
      <Table>
        <TableHeader>
          <th className="p-4 w-6/12">Company name</th>
          <th className="p-4 w-2/12 text-right">State</th>
          <th className="p-4 w-2/12 text-right">Updated</th>
          <th className="p-4 w-2/12 text-right">Registered</th>
        </TableHeader>
        <TableBody>
          {entities.map((item: Entity, rowIndex: number) => {
            return (
              <tr key={rowIndex}>
                <td className="p-0 table-fixed break-all">
                  <div className="flex p-4 bg-white mb-1 items-center rounded-l-lg">
                    <Image
                      className="mr-2"
                      src={item.logo_url}
                      alt={item.name}
                      width={24}
                      height={24}
                    />
                    <p className="leading-6 min-h-6 h-6 overflow-hidden">
                      {item.name}
                    </p>
                  </div>
                </td>
                <td className="p-0 table-fixed break-all">
                  <div className="p-4 bg-white mb-1">
                    <p className="leading-6 min-h-6 h-6 overflow-hidden text-right">
                      {item.status}
                    </p>
                  </div>
                </td>
                <td className="p-0 table-fixed break-all">
                  <div className="p-4 bg-white mb-1 ">
                    <p className="leading-6 min-h-6 h-6 overflow-hidden text-right">
                      {dayjs(item.updatedAt).format('DD/MM/YYYY')}
                    </p>
                  </div>
                </td>
                <td className="p-0 table-fixed break-all">
                  <div className="p-4 bg-white mb-1 rounded-r-lg">
                    <p className="leading-6 min-h-6 h-6 overflow-hidden text-right">
                      {dayjs(item.createdAt).format('DD/MM/YYYY')}
                    </p>
                  </div>
                </td>
              </tr>
            )
          })}
        </TableBody>
      </Table>
    </PageContainer>
  )
}

function getAuthToken() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  return token
}
