import React, { useState } from "react";
// import Orders from "./pages/Orders";
// import CreateOrder from "./components/modal/CreateOrder";
import { FiEdit, FiTrash2 } from "react-icons/fi";
import OrderDashboard from "../components/dashboard/OrderDashboard";
import CreateOrder from "../components/modal/CreateOrder";
const initialData = [
  { client: "Amit Sharma", po: 1201, order: "#ORD-HYD-2025-001", poDate: "02-Apr-2025", delivery: "03-Apr-2025", amount: "₹ 4,500", status: "PACKED" },
  { client: "Sneha Reddy", po: 1202, order: "#ORD-HYD-2025-002", poDate: "02-Apr-2025", delivery: "05-Apr-2025", amount: "₹ 6,660", status: "PROCESSING" },
  { client: "Ravi Teja", po: 1203, order: "#ORD-HYD-2025-003", poDate: "03-Apr-2025", delivery: "09-Apr-2025", amount: "₹ 500", status: "PROCESSING" },
  { client: "Neha Kapoor", po: 1204, order: "#ORD-HYD-2025-004", poDate: "22-Mar-2025", delivery: "22-Mar-2025", amount: "₹ 800", status: "PROCESSING" },
  { client: "Karan Malhotra", po: 1205, order: "#ORD-HYD-2025-005", poDate: "22-Mar-2025", delivery: "28-Mar-2025", amount: "₹ 3,960", status: "PROCESSING" },
  { client: "Priya Mehta", po: 1206, order: "#ORD-HYD-2025-006", poDate: "22-Mar-2025", delivery: "23-Mar-2025", amount: "₹ 1,200", status: "PROCESSING" },
  { client: "Vikram Singh", po: 1207, order: "#ORD-HYD-2025-007", poDate: "22-Mar-2025", delivery: "28-Mar-2025", amount: "₹ 5,250", status: "PROCESSING" },
  { client: "Aarav Nair", po: 1208, order: "#ORD-HYD-2025-008", poDate: "22-Mar-2025", delivery: "24-Mar-2025", amount: "₹ 2,000", status: "PROCESSING" },
  { client: "Divya Joshi", po: 1209, order: "#ORD-HYD-2025-009", poDate: "22-Mar-2025", delivery: "18-Mar-2025", amount: "₹ 1,750", status: "PROCESSING" },
  { client: "Manoj Desai", po: 1210, order: "#ORD-HYD-2025-010", poDate: "22-Mar-2025", delivery: "11-Mar-2025", amount: "₹ 1,500", status: "PROCESSING" },
  { client: "Tanvi Verma", po: 1211, order: "#ORD-HYD-2025-011", poDate: "21-Mar-2025", delivery: "22-Mar-2025", amount: "₹ 1,000", status: "PROCESSING" },
  { client: "Rajeev Bhatia", po: 1212, order: "#ORD-HYD-2025-012", poDate: "20-Mar-2025", delivery: "21-Mar-2025", amount: "₹ 2,300", status: "PROCESSING" },
];



export default function Orders() {
  const [data, setData] = useState(initialData);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [currentOrder, setCurrentOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState("All");

  const openModal = (mode = "add", order = null) => {
    setModalMode(mode);
    setCurrentOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentOrder(null);
  };

  const handleSubmit = (order) => {
    if (modalMode === "edit") {
      setData(data.map(d => d.order === order.order ? order : d));
    } else {
      setData([...data, order]);
    }
    closeModal();
  };

  const handleEdit = (order) => {
    openModal("edit", order);
  };

  const handleDelete = (orderId) => {
    setData(data.filter(d => d.order !== orderId));
  };

  const filteredData =
    statusFilter === "All"
      ? data
      : data.filter((order) => order.status === statusFilter);

  const columns = [
    { accessorKey: "client", header: "CLIENT" },
    { accessorKey: "po", header: "PO NUMBER" },
    { accessorKey: "order", header: "ORDER NUMBER" },
    { accessorKey: "poDate", header: "PO DATE" },
    { accessorKey: "delivery", header: "DELIVERY DATE" },
    { accessorKey: "amount", header: "TOTAL AMT." },
    { accessorKey: "status", header: "STATUS" },
  ];

  return (
    <div className="p-6 bg-green-50 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-4xl font-bold text-green-800 mb-4 md:mb-0">
          Orders Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-green-300 rounded px-3 py-2 bg-white shadow-sm"
          >
            <option value="All">All Statuses</option>
            <option value="PROCESSING">Processing</option>
            <option value="PACKED">Packed</option>
            {/* Add more statuses if needed */}
          </select>
          <button
            onClick={openModal}
            className="bg-green-600 hover:bg-green-700 transition-colors text-white px-5 py-2 rounded shadow"
          >
            + Add Order
          </button>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-md">
        <OrderDashboard
         data={filteredData}
         columns={columns}
         onEdit={handleEdit}
         onDelete={handleDelete}
         />
        {/* data={filteredData}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete} */}
      </div>

      <CreateOrder
        isOpen={isModalOpen}
        closeModal={closeModal}
        onSubmit={handleSubmit}
        mode={modalMode}
        formData={currentOrder}
      />
    </div>
  );
}

 