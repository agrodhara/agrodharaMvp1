import { useState, useEffect } from "react";

export default function CreateOrder({ isOpen, closeModal, onSubmit, mode, formData }) {
  const [form, setForm] = useState({
    client: "",
    po: "",
    order: "",
    poDate: "",
    delivery: "",
    amount: "",
    status: "PROCESSING"
  });

  useEffect(() => {
    if (mode === "edit" && formData) {
      setForm(formData);
    } else {
      setForm({
        client: "",
        po: "",
        order: "",
        poDate: "",
        delivery: "",
        amount: "",
        status: "PROCESSING"
      });
    }
  }, [mode, formData]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white p-6 rounded shadow w-[400px]">
        <h2 className="text-xl font-bold mb-4">
          {mode === "edit" ? "Edit Order" : "Create Order"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {["client", "po", "order", "poDate", "delivery", "amount"].map((field) => (
            <input
              key={field}
              type="text"
              name={field}
              value={form[field]}
              onChange={handleChange}
              placeholder={field.toUpperCase()}
              className="w-full border p-2 rounded"
              required
            />
          ))}
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          >
            <option value="Open">Open</option>
            <option value="Quotation">Quotation</option>
            <option value="Fulfilled">Fulfilled</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded">
              {mode === "edit" ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
