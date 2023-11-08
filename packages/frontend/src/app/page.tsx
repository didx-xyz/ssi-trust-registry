import React from 'react'
import dayjs from 'dayjs'
import { Button } from '@/common/components/Button'
import { PageHeading } from '@/common/components/PageHeading'
import { Text4xlBold } from '@/common/components/Typography'
import { TrustRegistry } from '@/common/interfaces'
import { PageContainer } from '@/common/components/PageContainer'
import Image from 'next/image'

async function getData(): Promise<TrustRegistry> {
  const res = await fetch('http://localhost:3000/api/registry')

  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }

  return res.json()
}

export default async function Home() {
  const data: TrustRegistry = await getData()

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
            {data.entities.map((item: any, rowIndex: number) => {
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
