import React from 'react'
import dayjs from 'dayjs'
import { Button } from '@/common/components/Button'
import { PageHeading } from '@/common/components/PageHeading'
import { Text4xlBold } from '@/common/components/Typography'
import { TrustRegistry, Entity } from '@/common/interfaces'
import { PageContainer } from '@/common/components/PageContainer'
import Image from 'next/image'

async function getData(): Promise<TrustRegistry> {
  try {
    const res = await fetch('http://localhost:3000/api/registry')
    return res.json()
  } catch (error) {
    return {
      entities: [],
      schemas: [],
    }
  }
}

export default async function Home() {
  const data: TrustRegistry = await getData()
  const transformedEntities: Entity[] = data.entities.map(
    (entity: Entity): Entity => {
      return {
        ...entity,
        updatedAt: dayjs(entity.updatedAt).format('DD/MM/YYYY'),
        createdAt: dayjs(entity.createdAt).format('DD/MM/YYYY'),
      }
    },
  )

  return (
    <PageContainer>
      <PageHeading>
        <Text4xlBold>Trusted Entities</Text4xlBold>
        <Button title="Invite a company" />
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
            {transformedEntities.map((item: Entity, rowIndex: number) => {
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
                        {item.updatedAt}
                      </p>
                    </div>
                  </td>
                  <td className="p-0">
                    <div className="p-4 bg-white mb-1 rounded-r-lg">
                      <p className="leading-6 text-right min-h-6">
                        {item.createdAt}
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
