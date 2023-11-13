import React from 'react'
import Image from 'next/image'
import dayjs from 'dayjs'
import { PageHeading } from '@/common/components/PageHeading'
import { Text4xlBold } from '@/common/components/Typography'
import { Submission } from '@/common/interfaces'
import { PageContainer } from '@/common/components/PageContainer'
import { Table, TableBody, TableHeader } from '@/common/components/Table'

async function getSubmissions() {
  try {
    const response: Response = await fetch(
      'http://localhost:3000/api/submissions',
    )
    const responseJson: Submission[] = await response.json()

    return responseJson
  } catch (error) {
    return []
  }
}

export default async function Page() {
  const submissions: Submission[] = await getSubmissions()

  return (
    <PageContainer>
      <PageHeading>
        <Text4xlBold>Submissions</Text4xlBold>
      </PageHeading>
      <Table>
        <TableHeader>
          <th className="p-4 w-5/12">Company name</th>
          <th className="p-4 w-1/12 text-right">State</th>
          <th className="p-4 w-2/12 text-right">Updated</th>
          <th className="p-4 w-2/12 text-right">Submitted</th>
          <th className="p-4 w-2/12 text-right">Email</th>
        </TableHeader>
        <TableBody>
          {submissions.map((item: Submission, rowIndex: number) => {
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
                <td className="p-0">
                  <div className="p-4 bg-white mb-1 rounded-r-lg">
                    <p className="leading-6 text-right min-h-6">{item.email}</p>
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
