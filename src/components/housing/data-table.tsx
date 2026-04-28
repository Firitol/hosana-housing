'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { House, SubCity, Woreda, Kebele } from '@/lib/definitions';
import { DataTableRowActions } from './data-table-row-actions';

interface DataTableProps {
  data: House[];
  subCities: SubCity[];
  woredas: Woreda[];
  kebeles: Kebele[];
}

export function DataTable({ data, subCities, woredas, kebeles }: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  
  const columns: ColumnDef<House>[] = [
    {
      accessorKey: 'houseNumber',
      header: 'House #',
    },
    {
      accessorKey: 'householderName',
      header: 'Householder',
    },
    {
      accessorKey: 'subCityId',
      header: 'Sub-City',
      cell: ({ row }) => {
        const subCity = subCities.find(sc => sc.id === row.original.subCityId);
        return subCity ? subCity.name : 'N/A';
      },
    },
    {
      accessorKey: 'woredaId',
      header: 'Woreda',
      cell: ({ row }) => {
        const woreda = woredas.find(w => w.id === row.original.woredaId);
        return woreda ? woreda.name : 'N/A';
      },
    },
    {
        accessorKey: 'kebeleId',
        header: 'Kebele',
        cell: ({ row }) => {
          const kebele = kebeles.find(k => k.id === row.original.kebeleId);
          return kebele ? kebele.name : 'N/A';
        },
      },
    {
      accessorKey: 'createdAt',
      header: 'Registered On',
      cell: ({ row }) => {
        return new Date(row.original.createdAt).toLocaleDateString();
      }
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        return <DataTableRowActions row={row} />;
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div>
        <div className="rounded-md border">
        <Table>
            <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                    return (
                    <TableHead key={header.id}>
                        {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                            )}
                    </TableHead>
                    );
                })}
                </TableRow>
            ))}
            </TableHeader>
            <TableBody>
            {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                >
                    {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                    ))}
                </TableRow>
                ))
            ) : (
                <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                </TableCell>
                </TableRow>
            )}
            </TableBody>
        </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
            >
                Previous
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
            >
                Next
            </Button>
        </div>
    </div>
  );
}
