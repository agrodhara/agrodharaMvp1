import React from "react";
// import TanstackTable from "../components/table/TanstackTable";
 import TanstackTable from "../tables/TanstackTable";

export default function OrderDashboard({ data, columns, onEdit, onDelete }) {
    return (
      <div className="p-6 bg-green-50 min-h-screen">
        <TanstackTable
        data={data}
        columns={columns}
        onEdit={onEdit}
        onDelete={onDelete}
        />

      </div>
    );
  }
  