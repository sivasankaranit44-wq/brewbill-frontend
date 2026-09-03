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
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    client: "",
    dueDate: "",
    taxRate: 18,
    discount: 0,
    notes: "",
    items: [{ description: "", quantity: 1, rate: 0 }],
  })

  const headers = { Authorization: `Bearer ${user?.token}` }

  useEffect(() => {
    axios.get(`${API}/api/clients`, { headers }).then((res) => setClients(res.data.data))
  }, [])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items]
    updated[index][field] = field === "quantity" || field === "rate" ? Number(value) : value
    setFormData({ ...formData, items: updated })
  }

  const addItem = () => {
    setFormData({ ...formData, items: [...formData.items, { description: "", quantity: 1, rate: 0 }] })
  }

  const removeItem = (index) => {
    const updated = formData.items.filter((_, i) => i !== index)
    setFormData({ ...formData, items: updated })
  }

  const subtotal = formData.items.reduce((sum, item) => sum + item.quantity * item.rate, 0)
  const taxAmount = (subtotal * formData.taxRate) / 100
  const total = subtotal + taxAmount - Number(formData.discount)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await axios.post(`${API}/api/invoices`, formData, { headers })
      navigate("/invoices")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create invoice")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Create Invoice</h1>
          <p className="text-gray-500 text-sm mt-1">Fill in the details below</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Left - Main Form */}
            <div className="lg:col-span-2 space-y-6">

              {/* Client & Date */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Invoice Details</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Client *</label>
                    <select
                      name="client"
                      value={formData.client}
                      onChange={handleChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="">Select client</option>
                      {clients.map((c) => (
                        <option key={c._id} value={c._id}>{c.name} — {c.company}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Due Date *</label>
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
              </div>

              {/* Items */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-900">Items</h2>
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
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <input
                          placeholder="Description"
                          value={item.description}
                          onChange={(e) => handleItemChange(index, "description", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          placeholder="Qty"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          placeholder="Rate"
                          value={item.rate}
                          onChange={(e) => handleItemChange(index, "rate", e.target.value)}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div className="col-span-1 text-right text-sm text-gray-600 font-medium">
                        ₹{(item.quantity * item.rate).toLocaleString()}
                      </div>
                      <div className="col-span-1 text-right">
                        {formData.items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
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

              {/* Notes */}
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Notes</h2>
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

            {/* Right - Summary */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 mb-4">Summary</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500">Tax Rate (%)</span>
                    <input
                      type="number"
                      name="taxRate"
                      value={formData.taxRate}
                      onChange={handleChange}
                      className="w-16 border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Tax Amount</span>
                    <span>₹{taxAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-gray-500">Discount (₹)</span>
                    <input
                      type="number"
                      name="discount"
                      value={formData.discount}
                      onChange={handleChange}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm text-right focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                  <div className="border-t border-gray-100 pt-3 flex justify-between">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-amber-700 text-lg">₹{total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-amber-700 hover:bg-amber-800 text-white font-medium py-3 rounded-lg text-sm transition disabled:opacity-50"
                >
                  {loading ? "Creating..." : "Create Invoice"}
                </button>

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