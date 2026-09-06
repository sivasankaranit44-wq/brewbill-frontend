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

  const headers = {
    Authorization: `Bearer ${user?.token}`,
  }

  const fetchInvoices = async () => {
    setLoading(true)

    try {
      const res = await axios.get(
        `${API}/api/invoices?status=${status}`,
        { headers }
      )

      setInvoices(res.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user?.token) return
    fetchInvoices()
  }, [status, user?.token])

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this invoice?")) return

    try {
      await axios.delete(
        `${API}/api/invoices/${id}`,
        { headers }
      )

      fetchInvoices()
    } catch (err) {
      console.error(err)
      alert("Failed to delete invoice")
    }
  }

  const handleDownload = async (id, invoiceNumber) => {
    try {
      const res = await axios.get(
        `${API}/api/invoices/${id}/pdf`,
        {
          headers,
          responseType: "blob",
        }
      )

      const url = window.URL.createObjectURL(res.data)

      const link = document.createElement("a")
      link.href = url
      link.download = `${invoiceNumber}.pdf`

      document.body.appendChild(link)
      link.click()
      link.remove()

      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error("PDF DOWNLOAD ERROR:", err)
      console.error("STATUS:", err.response?.status)
      console.error("RESPONSE:", err.response?.data)

      alert(
        `PDF download failed: ${
          err.response?.status || "Unknown error"
        }`
      )
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await axios.put(
        `${API}/api/invoices/${id}`,
        { status: newStatus },
        { headers }
      )

      fetchInvoices()
    } catch (err) {
      console.error(err)
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

    return (
      colors[status] ||
      "bg-gray-100 text-gray-600"
    )
  }

  const filterStatuses = [
    "All",
    "Draft",
    "Sent",
    "Paid",
    "Overdue",
    "Cancelled",
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      <Sidebar />

      {/* Main Content */}
      <main className="lg:ml-64 pt-20 lg:pt-0">

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

          {/* =========================
              HEADER
          ========================== */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Invoices
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                Manage and track your invoices
              </p>
            </div>

            <Link
              to="/invoices/create"
              className="inline-flex items-center justify-center bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-5 py-3 rounded-lg transition w-full sm:w-auto"
            >
              + New Invoice
            </Link>

          </div>

          {/* =========================
              FILTERS
          ========================== */}
          <div className="mb-6 overflow-x-auto">
            <div className="flex gap-2 min-w-max pb-1">

              {filterStatuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  className={`
                    px-4 py-2
                    rounded-full
                    text-xs
                    font-medium
                    transition
                    whitespace-nowrap
                    ${
                      status === s
                        ? "bg-amber-700 text-white"
                        : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                    }
                  `}
                >
                  {s}
                </button>
              ))}

            </div>
          </div>

          {/* =========================
              CONTENT
          ========================== */}
          {loading ? (

            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-400 text-sm">
                Loading invoices...
              </p>
            </div>

          ) : invoices.length === 0 ? (

            /* Empty State */
            <div className="bg-white rounded-xl border border-gray-200 p-10 sm:p-14 text-center">

              <h2 className="text-lg font-semibold text-gray-900">
                No invoices found
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                {status === "All"
                  ? "Create your first invoice to get started."
                  : `There are no ${status.toLowerCase()} invoices.`}
              </p>

              {status === "All" && (
                <Link
                  to="/invoices/create"
                  className="inline-flex items-center justify-center mt-5 bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
                >
                  + Create Invoice
                </Link>
              )}

            </div>

          ) : (

            <>
              {/* =========================
                  DESKTOP TABLE
              ========================== */}
              <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">

                <div className="overflow-x-auto">

                  <table className="w-full text-sm">

                    <thead>
                      <tr className="text-gray-400 border-b border-gray-100">

                        <th className="px-6 py-4 text-left font-medium">
                          Invoice
                        </th>

                        <th className="px-6 py-4 text-left font-medium">
                          Client
                        </th>

                        <th className="px-6 py-4 text-left font-medium">
                          Amount
                        </th>

                        <th className="px-6 py-4 text-left font-medium">
                          Due Date
                        </th>

                        <th className="px-6 py-4 text-left font-medium">
                          Status
                        </th>

                        <th className="px-6 py-4 text-left font-medium">
                          Actions
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {invoices.map((invoice) => (
                        <tr
                          key={invoice._id}
                          className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition"
                        >

                          {/* Invoice */}
                          <td className="px-6 py-4 font-medium text-amber-700 whitespace-nowrap">
                            {invoice.invoiceNumber}
                          </td>

                          {/* Client */}
                          <td className="px-6 py-4 text-gray-600">
                            {invoice.client?.name || "—"}
                          </td>

                          {/* Amount */}
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                            ₹{invoice.total.toLocaleString()}
                          </td>

                          {/* Due Date */}
                          <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                            {new Date(
                              invoice.dueDate
                            ).toLocaleDateString()}
                          </td>

                          {/* Status */}
                          <td className="px-6 py-4">

                            <select
                              value={invoice.status}
                              onChange={(e) =>
                                handleStatusUpdate(
                                  invoice._id,
                                  e.target.value
                                )
                              }
                              className={`
                                px-2.5 py-1.5
                                rounded-full
                                text-xs
                                font-medium
                                border-0
                                cursor-pointer
                                focus:outline-none
                                ${statusColor(invoice.status)}
                              `}
                            >

                              {[
                                "Draft",
                                "Sent",
                                "Paid",
                                "Overdue",
                                "Cancelled",
                              ].map((s) => (
                                <option
                                  key={s}
                                  value={s}
                                >
                                  {s}
                                </option>
                              ))}

                            </select>

                          </td>

                          {/* Actions */}
                          <td className="px-6 py-4">

                            <div className="flex items-center gap-3">

                              <button
                                type="button"
                                onClick={() =>
                                  handleDownload(
                                    invoice._id,
                                    invoice.invoiceNumber
                                  )
                                }
                                className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                              >
                                PDF
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  handleDelete(invoice._id)
                                }
                                className="text-red-500 hover:text-red-700 text-xs font-medium"
                              >
                                Delete
                              </button>

                            </div>

                          </td>

                        </tr>
                      ))}

                    </tbody>

                  </table>

                </div>

              </div>

              {/* =========================
                  MOBILE CARDS
              ========================== */}
              <div className="md:hidden space-y-3">

                {invoices.map((invoice) => (
                  <div
                    key={invoice._id}
                    className="bg-white rounded-xl border border-gray-200 p-4"
                  >

                    {/* Top */}
                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="text-sm font-semibold text-amber-700">
                          {invoice.invoiceNumber}
                        </p>

                        <p className="text-sm text-gray-700 mt-1 truncate">
                          {invoice.client?.name || "—"}
                        </p>

                      </div>

                      <select
                        value={invoice.status}
                        onChange={(e) =>
                          handleStatusUpdate(
                            invoice._id,
                            e.target.value
                          )
                        }
                        className={`
                          shrink-0
                          max-w-[110px]
                          px-2 py-1.5
                          rounded-full
                          text-xs
                          font-medium
                          border-0
                          cursor-pointer
                          focus:outline-none
                          ${statusColor(invoice.status)}
                        `}
                      >

                        {[
                          "Draft",
                          "Sent",
                          "Paid",
                          "Overdue",
                          "Cancelled",
                        ].map((s) => (
                          <option
                            key={s}
                            value={s}
                          >
                            {s}
                          </option>
                        ))}

                      </select>

                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-4 mt-5 pt-4 border-t border-gray-100">

                      <div>
                        <p className="text-xs text-gray-400">
                          Amount
                        </p>

                        <p className="text-sm font-semibold text-gray-900 mt-1">
                          ₹{invoice.total.toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          Due Date
                        </p>

                        <p className="text-sm text-gray-600 mt-1">
                          {new Date(
                            invoice.dueDate
                          ).toLocaleDateString()}
                        </p>
                      </div>

                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-100">

                      <button
                        type="button"
                        onClick={() =>
                          handleDownload(
                            invoice._id,
                            invoice.invoiceNumber
                          )
                        }
                        className="text-blue-500 hover:text-blue-700 text-xs font-medium"
                      >
                        Download PDF
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(invoice._id)
                        }
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Delete
                      </button>

                    </div>

                  </div>
                ))}

              </div>
            </>

          )}

        </div>

      </main>

    </div>
  )
}
