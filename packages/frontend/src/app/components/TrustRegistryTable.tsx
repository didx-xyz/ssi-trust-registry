'use client'
import React, { useEffect, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/common/components/Table'
import { Entity } from '@/common/interfaces'
import Image from 'next/image'
import dayjs from 'dayjs'
import { useRouter } from 'next/navigation'
import { backendUrl, betterFetch } from '@/api'

export function TrustRegistryTable() {
  const router = useRouter()
  const [entities, setEntities] = useState<Entity[]>([])

  useEffect(() => {
    getEntities()
      .then((entities) => {
        setEntities(entities)
      })
      .catch(() => {
        setEntities([])
      })
  }, [])

  return (
    <Table>
      <TableHeader>
        <th className="w-8/12">Company name</th>
        <th className="w-2/12 text-right">Updated</th>
        <th className="w-2/12 text-right">Registered</th>
      </TableHeader>
      <TableBody>
        {entities.map((item: Entity, rowIndex: number) => {
          return (
            <TableRow key={rowIndex} onClick={() => router.push(`/${item.id}`)}>
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
  )
}

async function getEntities() {
  const response = await betterFetch('GET', `${await backendUrl}/api/registry`)
  return response.entities
}
