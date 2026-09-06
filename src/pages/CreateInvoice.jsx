import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import Sidebar from "../components/Sidebar"

const API = import.meta.env.VITE_API_URL

export default function CreateInvoice() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(false)
  const [clientLoading, setClientLoading] = useState(false)
  const [error, setError] = useState("")
  const [showClientForm, setShowClientForm] = useState(false)

  const [formData, setFormData] = useState({
    client: "",
    dueDate: "",
    taxRate: 18,
    discount: 0,
    notes: "",
    items: [
      {
        description: "",
        quantity: 1,
        rate: 0,
      },
    ],
  })

  const [clientForm, setClientForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    gstin: "",
  })

  const headers = {
    Authorization: `Bearer ${user?.token}`,
  }

  // =========================
  // FETCH CLIENTS
  // =========================
  useEffect(() => {
    if (!user?.token) return

    const fetchClients = async () => {
      try {
        const res = await axios.get(`${API}/api/clients`, {
          headers,
        })

        setClients(res.data.data || [])
      } catch (err) {
        console.error("Failed to fetch clients:", err)
      }
    }

    fetchClients()
  }, [user?.token])

  // =========================
  // INVOICE FORM CHANGE
  // =========================
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  // =========================
  // CLIENT FORM CHANGE
  // =========================
  const handleClientChange = (e) => {
    setClientForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  // =========================
  // ITEM CHANGE
  // =========================
  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items]

    updatedItems[index] = {
      ...updatedItems[index],
      [field]:
        field === "quantity" || field === "rate"
          ? Number(value)
          : value,
    }

    setFormData((prev) => ({
      ...prev,
      items: updatedItems,
    }))
  }

  // =========================
  // ADD ITEM
  // =========================
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          description: "",
          quantity: 1,
          rate: 0,
        },
      ],
    }))
  }

  // =========================
  // REMOVE ITEM
  // =========================
  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }))
  }

  // =========================
  // CREATE CLIENT
  // =========================
  const handleCreateClient = async (e) => {
    e.preventDefault()

    setClientLoading(true)
    setError("")

    try {
      const res = await axios.post(
        `${API}/api/clients`,
        clientForm,
        { headers }
      )

      const newClient = res.data.data

      // Add client to dropdown
      setClients((prev) => [...prev, newClient])

      // Automatically select new client
      setFormData((prev) => ({
        ...prev,
        client: newClient._id,
      }))

      // Reset client form
      setClientForm({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: "",
        gstin: "",
      })

      // Close form
      setShowClientForm(false)
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create client"
      )
    } finally {
      setClientLoading(false)
    }
  }

  // =========================
  // CALCULATIONS
  // =========================
  const subtotal = formData.items.reduce(
    (sum, item) =>
      sum +
      Number(item.quantity || 0) *
        Number(item.rate || 0),
    0
  )

  const taxAmount =
    (subtotal * Number(formData.taxRate || 0)) / 100

  const total =
    subtotal +
    taxAmount -
    Number(formData.discount || 0)

  // =========================
  // CREATE INVOICE
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError("")

    try {
      await axios.post(
        `${API}/api/invoices`,
        formData,
        { headers }
      )

      navigate("/invoices")
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to create invoice"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      <main className="lg:ml-64 pt-20 lg:pt-0">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

          {/* =========================
              PAGE HEADER
          ========================== */}
          <div className="mb-6 sm:mb-8">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Create Invoice
            </h1>

            <p className="text-gray-500 text-sm mt-1">
              Fill in the details below
            </p>
          </div>

          {/* =========================
              ERROR
          ========================== */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6">

              {/* =====================================================
                  LEFT CONTENT
              ====================================================== */}
              <div className="lg:col-span-2 space-y-5 lg:space-y-6">

                {/* =========================
                    INVOICE DETAILS
                ========================== */}
                <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">

                  <h2 className="font-semibold text-gray-900 mb-5">
                    Invoice Details
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Client */}
                    <div>
                      <div className="flex items-center justify-between gap-3 mb-1.5">

                        <label className="text-xs font-medium text-gray-600">
                          Client *
                        </label>

                        <button
                          type="button"
                          onClick={() => {
                            setShowClientForm((prev) => !prev)
                            setError("")
                          }}
                          className="text-xs font-medium text-amber-700 hover:text-amber-800 whitespace-nowrap"
                        >
                          {showClientForm
                            ? "Cancel"
                            : "+ Add New Client"}
                        </button>

                      </div>

                      <select
                        name="client"
                        value={formData.client}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      >
                        <option value="">
                          {clients.length === 0
                            ? "No clients yet"
                            : "Select client"}
                        </option>

                        {clients.map((client) => (
                          <option
                            key={client._id}
                            value={client._id}
                          >
                            {client.name} — {client.company}
                          </option>
                        ))}
                      </select>

                      {clients.length === 0 && (
                        <p className="text-xs text-gray-500 mt-2">
                          No clients found. Add your first client.
                        </p>
                      )}
                    </div>

                    {/* Due Date */}
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Due Date *
                      </label>

                      <input
                        type="date"
                        name="dueDate"
                        value={formData.dueDate}
                        onChange={handleChange}
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>

                  </div>

                  {/* 
                      NEW CLIENT FORM
                   */}
                  {showClientForm && (
                    <div className="mt-6 pt-6 border-t border-gray-200">

                      <div className="mb-5">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Add New Client
                        </h3>

                        <p className="text-xs text-gray-500 mt-1">
                          Enter the client's details below.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                        {/* Name */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            Client Name *
                          </label>

                          <input
                            type="text"
                            name="name"
                            value={clientForm.name}
                            onChange={handleClientChange}
                            placeholder="John Doe"
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          />
                        </div>

                        {/* Company */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            Company *
                          </label>

                          <input
                            type="text"
                            name="company"
                            value={clientForm.company}
                            onChange={handleClientChange}
                            placeholder="ABC Technologies"
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          />
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            Email *
                          </label>

                          <input
                            type="email"
                            name="email"
                            value={clientForm.email}
                            onChange={handleClientChange}
                            placeholder="client@example.com"
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          />
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            Phone *
                          </label>

                          <input
                            type="tel"
                            name="phone"
                            value={clientForm.phone}
                            onChange={handleClientChange}
                            placeholder="9876543210"
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          />
                        </div>

                        {/* Address */}
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            Address *
                          </label>

                          <input
                            type="text"
                            name="address"
                            value={clientForm.address}
                            onChange={handleClientChange}
                            placeholder="Chennai, Tamil Nadu"
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          />
                        </div>

                        {/* GSTIN */}
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1.5">
                            GSTIN *
                          </label>

                          <input
                            type="text"
                            name="gstin"
                            value={clientForm.gstin}
                            onChange={handleClientChange}
                            placeholder="GSTIN"
                            required
                            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                          />
                        </div>

                      </div>

                      {/* Save Client */}
                      <button
                        type="button"
                        onClick={handleCreateClient}
                        disabled={clientLoading}
                        className="w-full sm:w-auto mt-5 bg-amber-700 hover:bg-amber-800 text-white px-5 py-3 rounded-lg text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {clientLoading
                          ? "Saving..."
                          : "Save Client"}
                      </button>

                    </div>
                  )}

                </section>

                {/* 
                    ITEMS
                 */}
                <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">

                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div>
                      <h2 className="font-semibold text-gray-900">
                        Items
                      </h2>

                      <p className="text-xs text-gray-500 mt-1">
                        Add the services or products for this invoice.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={addItem}
                      className="text-amber-700 text-sm font-medium hover:text-amber-800 whitespace-nowrap"
                    >
                      + Add Item
                    </button>
                  </div>

                  <div className="space-y-4">

                    {formData.items.map((item, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-xl p-4 bg-gray-50"
                      >

                        {/* Desktop Header */}
                        <div className="hidden sm:grid grid-cols-12 gap-3 mb-2 text-xs font-medium text-gray-500">
                          <div className="col-span-5">
                            Description
                          </div>

                          <div className="col-span-2">
                            Quantity
                          </div>

                          <div className="col-span-2">
                            Rate
                          </div>

                          <div className="col-span-2 text-right">
                            Amount
                          </div>

                          <div className="col-span-1" />
                        </div>

                        {/* Item Fields */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">

                          {/* Description */}
                          <div className="sm:col-span-5">
                            <label className="sm:hidden block text-xs font-medium text-gray-600 mb-1.5">
                              Description
                            </label>

                            <input
                              type="text"
                              placeholder="Website Development"
                              value={item.description}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "description",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                          </div>

                          {/* Quantity */}
                          <div className="sm:col-span-2">
                            <label className="sm:hidden block text-xs font-medium text-gray-600 mb-1.5">
                              Quantity
                            </label>

                            <input
                              type="number"
                              min="1"
                              placeholder="1"
                              value={item.quantity}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "quantity",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                          </div>

                          {/* Rate */}
                          <div className="sm:col-span-2">
                            <label className="sm:hidden block text-xs font-medium text-gray-600 mb-1.5">
                              Rate
                            </label>

                            <input
                              type="number"
                              min="0"
                              placeholder="0"
                              value={item.rate}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "rate",
                                  e.target.value
                                )
                              }
                              className="w-full border border-gray-300 bg-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                            />
                          </div>

                          {/* Amount */}
                          <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-2">

                            <span className="sm:hidden text-xs font-medium text-gray-600">
                              Amount
                            </span>

                            <span className="text-sm font-semibold text-gray-700">
                              ₹
                              {(
                                Number(item.quantity || 0) *
                                Number(item.rate || 0)
                              ).toLocaleString()}
                            </span>

                          </div>

                          {/* Remove */}
                          <div className="sm:col-span-1 flex justify-end">

                            {formData.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeItem(index)}
                                className="w-full sm:w-auto px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              >
                                Remove
                              </button>
                            )}

                          </div>

                        </div>

                      </div>
                    ))}

                  </div>

                </section>

                {/* 
                    NOTES
                 */}
                <section className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6">

                  <h2 className="font-semibold text-gray-900 mb-4">
                    Notes
                  </h2>

                  <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Thank you for your business!"
                    rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />

                </section>

              </div>

              {/* 
                  RIGHT SUMMARY
               */}
              <div className="lg:col-span-1">

                <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 lg:sticky lg:top-6">

                  <h2 className="font-semibold text-gray-900 mb-5">
                    Summary
                  </h2>

                  <div className="space-y-4">

                    {/* Subtotal */}
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-gray-500">
                        Subtotal
                      </span>

                      <span className="font-medium text-gray-900">
                        ₹{subtotal.toLocaleString()}
                      </span>
                    </div>

                    {/* Tax Rate */}
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-gray-500">
                        Tax Rate (%)
                      </span>

                      <input
                        type="number"
                        min="0"
                        name="taxRate"
                        value={formData.taxRate}
                        onChange={handleChange}
                        className="w-20 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    {/* Tax Amount */}
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-gray-500">
                        Tax Amount
                      </span>

                      <span className="text-gray-900">
                        ₹{taxAmount.toLocaleString()}
                      </span>
                    </div>

                    {/* Discount */}
                    <div className="flex items-center justify-between gap-4 text-sm">
                      <span className="text-gray-500">
                        Discount (₹)
                      </span>

                      <input
                        type="number"
                        min="0"
                        name="discount"
                        value={formData.discount}
                        onChange={handleChange}
                        className="w-24 border border-gray-300 rounded-lg px-2 py-1.5 text-sm text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                      />
                    </div>

                    {/* Total */}
                    <div className="border-t border-gray-100 pt-4 flex items-center justify-between gap-4">
                      <span className="font-bold text-gray-900">
                        Total
                      </span>

                      <span className="font-bold text-amber-700 text-xl">
                        ₹{total.toLocaleString()}
                      </span>
                    </div>

                  </div>

                  {/* Actions */}
                  <div className="mt-6 space-y-2">

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-amber-700 hover:bg-amber-800 text-white font-medium py-3 rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading
                        ? "Creating..."
                        : "Create Invoice"}
                    </button>

                    <button
                      type="button"
                      onClick={() => navigate("/invoices")}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg text-sm transition"
                    >
                      Cancel
                    </button>

                  </div>

                </div>

              </div>

            </div>
          </form>

        </div>
      </main>
    </div>
  )
}