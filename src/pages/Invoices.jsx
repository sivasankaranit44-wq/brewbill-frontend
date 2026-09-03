import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import Sidebar from "../components/Sidebar"

const API = import.meta.env.VITE_API_URL

export default function Invoices() {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState("All")

  const headers = { Authorization: `Bearer ${user?.token}` }

  const fetchInvoices = async () => {
    try {
      const res = await axios.get(`${API}/api/invoices?status=${status}`, { headers })
      setInvoices(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchInvoices() }, [status])

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice?")) return
    await axios.delete(`${API}/api/invoices/${id}`, { headers })
    fetchInvoices()
  }

  const handleDownload = async (id, invoiceNumber) => {
    try {
      const res = await axios.get(`${API}/api/invoices/${id}/pdf`, {
        headers,
        responseType: "blob",
      })
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", `${invoiceNumber}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (err) {
      alert("PDF download failed")
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(`${API}/api/invoices/${id}`, { status: newStatus }, { headers })
      fetchInvoices()
    } catch (err) {
      alert("Status update failed")
    }
  }

  const statusColor = (status) => {
    const colors = {
      Draft: "bg-gray-100 text-gray-600",
      Sent: "bg-blue-100 text-blue-600",
      Paid: "bg-green-100 text-green-600",
      Overdue: "bg-red-100 text-red-600",
      Cancelled: "bg-gray-100 text-gray-400",
    }
    return colors[status] || "bg-gray-100 text-gray-600"
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <Link
            to="/invoices/create"
            className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
          >
            + New Invoice
          </Link>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-6">
          {["All", "Draft", "Sent", "Paid", "Overdue", "Cancelled"].map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition ${
                status === s
                  ? "bg-amber-700 text-white"
                  : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-3 text-left">Invoice</th>
                  <th className="px-6 py-3 text-left">Client</th>
                  <th className="px-6 py-3 text-left">Amount</th>
                  <th className="px-6 py-3 text-left">Due Date</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-amber-700">{invoice.invoiceNumber}</td>
                    <td className="px-6 py-3 text-gray-600">{invoice.client?.name || "—"}</td>
                    <td className="px-6 py-3 font-medium">₹{invoice.total.toLocaleString()}</td>
                    <td className="px-6 py-3 text-gray-500">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                    <td className="px-6 py-3">
                      <select
                        value={invoice.status}
                        onChange={(e) => handleStatusUpdate(invoice._id, e.target.value)}
                        className={`px-2 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColor(invoice.status)}`}
                      >
                        {["Draft", "Sent", "Paid", "Overdue", "Cancelled"].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleDownload(invoice._id, invoice.invoiceNumber)}
                          className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                        >
                          PDF
                        </button>
                        <button
                          onClick={() => handleDelete(invoice._id)}
                          className="text-red-500 hover:text-red-700 text-xs font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                      No invoices found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  )
}