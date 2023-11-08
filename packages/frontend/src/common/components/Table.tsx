import React from 'react'
import TableColumnTitle from '@/common/components/TableColumnTitle'
import TableRow from '@/common/components/TableRow'
import TableIconRow from '@/common/components/TableIconRow'
import { Entity } from '@/common/interfaces'

interface Params {
  tableDataConfig: TableDataConfigItem[]
  items: Entity[]
}

export interface TableDataConfigItem {
  title: string
  additionalTitleClasses?: string
  columnValue: string
  cellType?: string
}

const Table = ({ tableDataConfig, items }: Params) => {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr className="text-sm text-primary">
            {tableDataConfig.map(
              (tableDataItem: TableDataConfigItem, index: number) => (
                <TableColumnTitle
                  key={index}
                  additionalTitleClasses={tableDataItem.additionalTitleClasses}
                  title={tableDataItem.title}
                />
              ),
            )}
          </tr>
        </thead>
        <tbody>
          {items.map((item: any, rowIndex: number) => {
            return (
              <tr key={rowIndex}>
                {tableDataConfig.map(
                  (
                    tableDataItem: TableDataConfigItem,
                    cellIndex: number,
                    array: TableDataConfigItem[],
                  ) => {
                    let additionalRowClasses: string = ''

                    if (cellIndex === 0) {
                      additionalRowClasses += 'rounded-l-lg'
                    } else if (cellIndex + 1 === array.length) {
                      additionalRowClasses += 'rounded-r-lg'
                    }

                    if (tableDataItem.cellType === 'icon') {
                      return (
                        <TableIconRow
                          key={cellIndex}
                          value={item[tableDataConfig[cellIndex].columnValue]}
                          logo={item.logo_url}
                          additionalRowClasses={additionalRowClasses}
                        />
                      )
                    } else {
                      return (
                        <TableRow
                          key={cellIndex}
                          value={item[tableDataConfig[cellIndex].columnValue]}
                          additionalRowClasses={additionalRowClasses}
                        />
                      )
                    }
                  },
                )}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

export default Table
