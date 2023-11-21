'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import dayjs from 'dayjs'
import { PageHeading } from '@/common/components/PageHeading'
import { Text4xlBold } from '@/common/components/Typography'
import { Submission } from '@/common/interfaces'
import { PageContainer } from '@/common/components/PageContainer'
import { Table, TableBody, TableHeader } from '@/common/components/Table'
import { Filter, FilterButton } from '@/common/components/Filter'
import { betterFetch } from '@/api'

export default function Page() {
  const [submissions, setSubmissions] = useState([])
  const [filterValues, setFilterValues] = useState<string[]>([])

  function toggleFilterValue(filter: string): void {
    if (filterValues.includes(filter)) {
      const filterIndex = filterValues.indexOf(filter)

      filterValues.splice(filterIndex, 1)
      setFilterValues([...filterValues])
    } else {
      setFilterValues([...filterValues, filter])
    }
  }

  function isActive(filter: string): boolean {
    return filterValues.includes(filter)
  }

  useEffect(() => {
    betterFetch('GET', 'http://localhost:3000/api/submissions')
      .then((submissions) => {
        setSubmissions(submissions)
      })
      .catch(() => {
        setSubmissions([])
      })
  }, [])

  return (
    <PageContainer>
      <PageHeading>
        <Text4xlBold>Submissions</Text4xlBold>
      </PageHeading>

      <Filter>
        <FilterButton
          isActive={isActive('pending')}
          onClick={() => toggleFilterValue('pending')}
          value="pending"
        />
        <FilterButton
          isActive={isActive('declined')}
          onClick={() => toggleFilterValue('declined')}
          value="declined"
        />
        <FilterButton
          isActive={isActive('approved')}
          onClick={() => toggleFilterValue('approved')}
          value="approved"
        />
      </Filter>

      <Table>
        <TableHeader>
          <th className="p-4 w-5/12">Company name</th>
          <th className="p-4 w-1/12 text-right">State</th>
          <th className="p-4 w-2/12 text-right">Updated</th>
          <th className="p-4 w-2/12 text-right">Submitted</th>
          <th className="p-4 w-2/12 text-right">Email</th>
        </TableHeader>
        <TableBody>
          {submissions
            .filter((item: Submission) => {
              return !filterValues.length || filterValues.includes(item.state)
            })
            .map((item: Submission, rowIndex: number) => {
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
                      <p className="leading-6 min-h-6 h-6 overflow-hidden text-right capitalize">
                        {item.state}
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
                    <div className="p-4 bg-white mb-1">
                      <p className="leading-6 min-h-6 h-6 overflow-hidden text-right">
                        {dayjs(item.createdAt).format('DD/MM/YYYY')}
                      </p>
                    </div>
                  </td>
                  <td className="p-0 table-fixed break-all">
                    <div className="p-4 bg-white mb-1 rounded-r-lg">
                      <p className="leading-6 min-h-6 h-6 overflow-hidden text-right">
                        {item.email}
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
