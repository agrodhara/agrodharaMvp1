import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function TanstackTable({ data, columns, onEdit, onDelete }) {
  // Add Actions column dynamically
  const enhancedColumns = React.useMemo(() => {
    return [
      ...columns,
      {
        header: "ACTIONS",
        cell: ({ row }) => (
          <div className="flex gap-3 text-lg">
            <FaEdit
              className="text-blue-600 cursor-pointer hover:scale-110 transition"
              onClick={() => onEdit && onEdit(row.original)}
              title="Edit"
            />
            <FaTrash
              className="text-red-600 cursor-pointer hover:scale-110 transition"
              onClick={() => onDelete && onDelete(row.original.order)}
              title="Delete"
            />
          </div>
        ),
      },
    ];
  }, [columns, onEdit, onDelete]);

  const table = useReactTable({
    data,
    columns: enhancedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="overflow-auto bg-white rounded-xl shadow-md">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-green-600 text-white">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="p-3 font-medium whitespace-nowrap">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>

        <tbody className="text-gray-700">
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="border-b hover:bg-green-50 transition-colors duration-200"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="p-3 whitespace-nowrap">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between mt-4 px-4 py-2 text-sm gap-2">
        <div>Showing {table.getRowModel().rows.length} rows</div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded bg-gray-100 hover:bg-green-200 transition disabled:opacity-50"
          >
            ⏮
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 border rounded bg-gray-100 hover:bg-green-200 transition disabled:opacity-50"
          >
            ◀
          </button>
          <span>
            Page <strong>{table.getState().pagination.pageIndex + 1}</strong> of{" "}
            <strong>{table.getPageCount()}</strong>
          </span>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded bg-gray-100 hover:bg-green-200 transition disabled:opacity-50"
          >
            ▶
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 border rounded bg-gray-100 hover:bg-green-200 transition disabled:opacity-50"
          >
            ⏭
          </button>
        </div>
      </div>
    </div>
  );
}
