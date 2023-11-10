import React from 'react'
import dayjs from 'dayjs'
import Image from 'next/image'
import { cookies } from 'next/headers'
import { Button } from '@/common/components/Button'
import { PageHeading } from '@/common/components/PageHeading'
import { Text4xlBold } from '@/common/components/Typography'
import { Entity } from '@/common/interfaces'
import { PageContainer } from '@/common/components/PageContainer'
import { getUser } from '@/api'

async function getEntities(): Promise<Entity[]> {
  try {
    const response: Response = await fetch(
      'http://localhost:3000/api/registry',
      { cache: 'no-cache' },
    )
    const responseJson = await response.json()
    return responseJson.entities
  } catch (error) {
    return []
  }
}

export default async function Home() {
  const entities: Entity[] = await getEntities()
  const token = getAuthToken()
  const user = await getUser(token || '')
  console.log('user', user)

  return (
    <PageContainer>
      <PageHeading>
        <Text4xlBold>Trusted Entities</Text4xlBold>
        {user.user && <Button title="Invite a company" />}
      </PageHeading>
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr className="text-sm text-primary">
              <th className="p-4 w-6/12">Company name</th>
              <th className="p-4 w-2/12 text-right">State</th>
              <th className="p-4 w-2/12 text-right">Updated</th>
              <th className="p-4 w-2/12 text-right">Registered</th>
            </tr>
          </thead>
          <tbody>
            {entities.map((item: Entity, rowIndex: number) => {
              return (
                <tr key={rowIndex}>
                  <td className="p-0">
                    <div className="flex p-4 bg-white mb-1 items-center rounded-l-lg">
                      <Image
                        className="mr-2"
                        src={item.logo_url}
                        alt={item.name}
                        width={24}
                        height={24}
                      />
                      <p className="leading-6 min-h-6">{item.name}</p>
                    </div>
                  </td>
                  <td className="p-0">
                    <div className="p-4 bg-white mb-1">
                      <p className="leading-6 text-right min-h-6">
                        {item.status}
                      </p>
                    </div>
                  </td>
                  <td className="p-0">
                    <div className="p-4 bg-white mb-1 ">
                      <p className="leading-6 text-right min-h-6">
                        {dayjs(item.updatedAt).format('DD/MM/YYYY')}
                      </p>
                    </div>
                  </td>
                  <td className="p-0">
                    <div className="p-4 bg-white mb-1 rounded-r-lg">
                      <p className="leading-6 text-right min-h-6">
                        {dayjs(item.createdAt).format('DD/MM/YYYY')}
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

function getAuthToken() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  return token
}
