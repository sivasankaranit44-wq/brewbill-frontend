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
    items: [{ description: "", quantity: 1, rate: 0 }],
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

  // Fetch existing clients
  useEffect(() => {
    if (!user?.token) return

    axios
      .get(`${API}/api/clients`, { headers })
      .then((res) => {
        setClients(res.data.data || [])
      })
      .catch((err) => {
        console.error("Failed to fetch clients:", err)
      })
  }, [user?.token])

  // Invoice form changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Invoice item changes
  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items]

    updated[index][field] =
      field === "quantity" || field === "rate"
        ? Number(value)
        : value

    setFormData({
      ...formData,
      items: updated,
    })
  }

  // Add invoice item
  const addItem = () => {
    setFormData({
      ...formData,
      items: [
        ...formData.items,
        {
          description: "",
          quantity: 1,
          rate: 0,
        },
      ],
    })
  }

  // Remove invoice item
  const removeItem = (index) => {
    const updated = formData.items.filter((_, i) => i !== index)

    setFormData({
      ...formData,
      items: updated,
    })
  }

  // New client form changes
  const handleClientChange = (e) => {
    setClientForm({
      ...clientForm,
      [e.target.name]: e.target.value,
    })
  }

  // Create new client
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

      // Add new client to dropdown
      setClients((prev) => [...prev, newClient])

      // Automatically select the new client
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

      // Close client form
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

  // Calculations
  const subtotal = formData.items.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  )

  const taxAmount =
    (subtotal * Number(formData.taxRate)) / 100

  const total =
    subtotal +
    taxAmount -
    Number(formData.discount)

  // Create invoice
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 p-8">

        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Create Invoice
          </h1>

          <p className="text-gray-500 text-sm mt-1">
            Fill in the details below
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* =========================
                LEFT - MAIN FORM
            ========================== */}
            <div className="lg:col-span-2 space-y-6">

              {/* =========================
                  CLIENT & DATE
              ========================== */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">

                <h2 className="font-semibold text-gray-900 mb-4">
                  Invoice Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  {/* Client */}
                  <div>
                    <div className="flex items-center justify-between mb-1">

                      <label className="block text-xs font-medium text-gray-600">
                        Client *
                      </label>

                      <button
                        type="button"
                        onClick={() =>
                          setShowClientForm(!showClientForm)
                        }
                        className="text-xs font-medium text-amber-700 hover:text-amber-800"
                      >
                        + Add New Client
                      </button>

                    </div>

                    <select
                      name="client"
                      value={formData.client}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">
                        {clients.length === 0
                          ? "No clients yet"
                          : "Select client"}
                      </option>

                      {clients.map((c) => (
                        <option
                          key={c._id}
                          value={c._id}
                        >
                          {c.name} — {c.company}
                        </option>
                      ))}
                    </select>

                    {/* Empty client message */}
                    {clients.length === 0 && (
                      <p className="text-xs text-gray-500 mt-2">
                        No clients found. Add your first client.
                      </p>
                    )}
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Due Date *
                    </label>

                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                </div>

                {/* =========================
                    ADD NEW CLIENT FORM
                ========================== */}
                {showClientForm && (
                  <div className="mt-6 pt-6 border-t border-gray-200">

                    <div className="flex items-center justify-between mb-4">

                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Add New Client
                        </h3>

                        <p className="text-xs text-gray-500 mt-1">
                          Enter the client's details below.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setShowClientForm(false)
                          setError("")
                        }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel
                      </button>

                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {/* Client Name */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Client Name *
                        </label>

                        <input
                          type="text"
                          name="name"
                          value={clientForm.name}
                          onChange={handleClientChange}
                          required
                          placeholder="John Doe"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      {/* Company */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Company *
                        </label>

                        <input
                          type="text"
                          name="company"
                          value={clientForm.company}
                          onChange={handleClientChange}
                          required
                          placeholder="ABC Technologies"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Email *
                        </label>

                        <input
                          type="email"
                          name="email"
                          value={clientForm.email}
                          onChange={handleClientChange}
                          required
                          placeholder="client@example.com"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Phone *
                        </label>

                        <input
                          type="tel"
                          name="phone"
                          value={clientForm.phone}
                          onChange={handleClientChange}
                          required
                          placeholder="9876543210"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      {/* Address */}
                      <div className="md:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Address *
                        </label>

                        <input
                          type="text"
                          name="address"
                          value={clientForm.address}
                          onChange={handleClientChange}
                          required
                          placeholder="Chennai, Tamil Nadu"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      {/* GSTIN */}
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          GSTIN *
                        </label>

                        <input
                          type="text"
                          name="gstin"
                          value={clientForm.gstin}
                          onChange={handleClientChange}
                          required
                          placeholder="GSTIN"
                          className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                    </div>

                    {/* Save Client */}
                    <button
                      type="button"
                      onClick={handleCreateClient}
                      disabled={clientLoading}
                      className="mt-5 bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-50"
                    >
                      {clientLoading
                        ? "Saving..."
                        : "Save Client"}
                    </button>

                  </div>
                )}

              </div>

              {/* =========================
                  ITEMS
              ========================== */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">

                <div className="flex items-center justify-between mb-4">

                  <h2 className="font-semibold text-gray-900">
                    Items
                  </h2>

                  <button
                    type="button"
                    onClick={addItem}
                    className="text-amber-700 text-sm font-medium hover:text-amber-800"
                  >
                    + Add Item
                  </button>

                </div>

                <div className="space-y-3">

                  {formData.items.map((item, index) => (
                    <div
                      key={index}
                      className="grid grid-cols-12 gap-2 items-center"
                    >

                      {/* Description */}
                      <div className="col-span-5">
                        <input
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "description",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      {/* Quantity */}
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "quantity",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      {/* Rate */}
                      <div className="col-span-3">
                        <input
                          type="number"
                          placeholder="Rate"
                          min="0"
                          value={item.rate}
                          onChange={(e) =>
                            handleItemChange(
                              index,
                              "rate",
                              e.target.value
                            )
                          }
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>

                      {/* Amount */}
                      <div className="col-span-1 text-right text-sm text-gray-600 font-medium">
                        ₹
                        {(
                          item.quantity * item.rate
                        ).toLocaleString()}
                      </div>

                      {/* Remove */}
                      <div className="col-span-1 text-right">

                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeItem(index)
                            }
                            className="text-red-400 hover:text-red-600 text-lg"
                          >
                            ✕
                          </button>
                        )}

                      </div>

                    </div>
                  ))}

                </div>
              </div>

              {/* =========================
                  NOTES
              ========================== */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">

                <h2 className="font-semibold text-gray-900 mb-4">
                  Notes
                </h2>

                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Thank you for your business!"
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
                />

              </div>

            </div>

            {/* =========================
                RIGHT - SUMMARY
            ========================== */}
            <div className="space-y-6">

              <div className="bg-white rounded-xl border border-gray-200 p-6">

                <h2 className="font-semibold text-gray-900 mb-4">
                  Summary
                </h2>

                <div className="space-y-3 mb-4">

                  {/* Subtotal */}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">
                      Subtotal
                    </span>

                    <span className="font-medium">
                      ₹{subtotal.toLocaleString()}
                    </span>
                  </div>

                  {/* Tax Rate */}
                  <div className="flex justify-between text-sm items-center">

                    <span className="text-gray-500">
                      Tax Rate (%)
                    </span>

                    <input
                      type="number"
                      name="taxRate"
                      value={formData.taxRate}
                      onChange={handleChange}
                      className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />

                  </div>

                  {/* Tax Amount */}
                  <div className="flex justify-between text-sm">

                    <span className="text-gray-500">
                      Tax Amount
                    </span>

                    <span>
                      ₹{taxAmount.toLocaleString()}
                    </span>

                  </div>

                  {/* Discount */}
                  <div className="flex justify-between text-sm items-center">

                    <span className="text-gray-500">
                      Discount (₹)
                    </span>

                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />

                  </div>

                  {/* Total */}
                  <div className="border-t border-gray-100 pt-3 flex justify-between">

                    <span className="font-bold text-gray-900">
                      Total
                    </span>

                    <span className="font-bold text-amber-700 text-lg">
                      ₹{total.toLocaleString()}
                    </span>

                  </div>

                </div>

                {/* Create Invoice */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white font-medium py-3 rounded-lg text-sm transition disabled:opacity-50"
                >
                  {loading
                    ? "Creating..."
                    : "Create Invoice"}
                </button>

                {/* Cancel */}
                <button
                  type="button"
                  onClick={() => navigate("/invoices")}
                  className="w-full mt-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-lg text-sm transition"
                >
                  Cancel
                </button>

              </div>

            </div>

          </div>
        </form>

      </div>
    </div>
  )
}
