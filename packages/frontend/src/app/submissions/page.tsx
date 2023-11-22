'use client'
import React, { ReactNode, useEffect, useState } from 'react'
import Image from 'next/image'
import dayjs from 'dayjs'
import { PageHeading } from '@/common/components/PageHeading'
import { Text4xlBold, TextSmBold } from '@/common/components/Typography'
import { Submission } from '@/common/interfaces'
import { PageContainer } from '@/common/components/PageContainer'
import { Table, TableBody, TableHeader } from '@/common/components/Table'
import { betterFetch } from '@/api'
import { PlusIcon } from '@/common/components/images/PlusIcon'

export default function Page() {
  const [submissions, setSubmissions] = useState([])
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

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

      <Filter
        options={['pending', 'declined', 'approved']}
        selectedOptions={selectedFilters}
        onChange={setSelectedFilters}
      />

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
              return (
                !selectedFilters.length || selectedFilters.includes(item.state)
              )
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

interface FilterProps {
  options: string[]
  selectedOptions: string[]
  onChange: (value: string[]) => void
}

interface FilterButtonProps {
  onClick: any
  isActive: boolean
  value: string
}

function Filter({ options, selectedOptions, onChange }: FilterProps) {
  function toggleFilterValue(option: string): void {
    if (selectedOptions.includes(option)) {
      const optionIndex = selectedOptions.indexOf(option)

      selectedOptions.splice(optionIndex, 1)
      onChange([...selectedOptions])
    } else {
      onChange([...selectedOptions, option])
    }
  }

  function isActive(filter: string): boolean {
    return selectedOptions.includes(filter)
  }

  return (
    <div className="flex flex-col">
      <div className="pl-4 h-6 mb-2">
        <TextSmBold className="h-6">Filters</TextSmBold>
      </div>
      <div className="flex gap-x-2 mb-6">
        {options.map((option) => {
          return (
            <FilterButton
              key={option}
              isActive={isActive(option)}
              onClick={() => toggleFilterValue(option)}
              value={option}
            />
          )
        })}
      </div>
    </div>
  )
}

function FilterButton({ onClick, isActive, value }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={
        'btn rounded-full min-h-0 h-10 text-sm normal-case transition ' +
        (isActive
          ? 'bg-primary hover:bg-primary text-white'
          : 'bg-white hover:bg-white text-primary')
      }
    >
      <PlusIcon
        className={
          'transition duration-500 ' +
          (isActive ? 'rotate-45 text-white' : 'text-primary')
        }
      />
      <p className="capitalize">{value}</p>
    </button>
  )
}
