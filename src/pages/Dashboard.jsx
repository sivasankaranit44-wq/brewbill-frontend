import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import Sidebar from "../components/Sidebar"

const API = import.meta.env.VITE_API_URL

export default function Dashboard() {
  const { user } = useAuth()

  const [stats, setStats] = useState(null)
  const [recentInvoices, setRecentInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  const headers = {
    Authorization: `Bearer ${user?.token}`,
  }

  useEffect(() => {
    if (!user?.token) return

    const fetchData = async () => {
      try {
        const [statsRes, invoicesRes] = await Promise.all([
          axios.get(`${API}/api/invoices/stats`, {
            headers,
          }),
          axios.get(`${API}/api/invoices?limit=5`, {
            headers,
          }),
        ])

        setStats(statsRes.data.data)
        setRecentInvoices(invoicesRes.data.data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user?.token])

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

  const statsData = [
    {
      label: "Total Invoices",
      value: stats?.totalInvoices || 0,
      color: "text-gray-900",
    },
    {
      label: "Paid",
      value: stats?.paidInvoices || 0,
      color: "text-green-600",
    },
    {
      label: "Pending",
      value: stats?.pendingInvoices || 0,
      color: "text-blue-600",
    },
    {
      label: "Overdue",
      value: stats?.overdueInvoices || 0,
      color: "text-red-600",
    },
    {
      label: "Total Revenue",
      value: `₹${(
        stats?.totalRevenue || 0
      ).toLocaleString()}`,
      color: "text-green-600",
    },
    {
      label: "Pending Amount",
      value: `₹${(
        stats?.pendingAmount || 0
      ).toLocaleString()}`,
      color: "text-amber-600",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">

      <Sidebar />

      {/* Main Content */}
      <main className="lg:ml-64 pt-20 lg:pt-0">

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Dashboard
              </h1>

              <p className="text-gray-500 text-sm mt-1">
                Welcome back, {user?.name}!
              </p>
            </div>

            <Link
              to="/invoices/create"
              className="inline-flex items-center justify-center bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-5 py-3 rounded-lg transition w-full sm:w-auto"
            >
              + New Invoice
            </Link>

          </div>

          {/* Loading */}
          {loading ? (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
              Loading...
            </div>
          ) : (
            <>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-8">

                {statsData.map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl border border-gray-200 p-5"
                  >

                    <p className="text-xs font-medium text-gray-500 mb-2">
                      {stat.label}
                    </p>

                    <p
                      className={`text-xl sm:text-2xl font-bold ${stat.color} break-words`}
                    >
                      {stat.value}
                    </p>

                  </div>
                ))}

              </div>

              {/* Recent Invoices */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">

                {/* Section Header */}
                <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-gray-100">

                  <div>
                    <h2 className="font-semibold text-gray-900">
                      Recent Invoices
                    </h2>

                    <p className="text-xs text-gray-400 mt-1">
                      Your latest invoices
                    </p>
                  </div>

                  <Link
                    to="/invoices"
                    className="text-amber-700 text-sm font-medium hover:underline"
                  >
                    View all
                  </Link>

                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">

                  <table className="w-full text-sm">

                    <thead>
                      <tr className="text-gray-400 border-b border-gray-100">

                        <th className="px-6 py-3 text-left font-medium">
                          Invoice
                        </th>

                        <th className="px-6 py-3 text-left font-medium">
                          Client
                        </th>

                        <th className="px-6 py-3 text-left font-medium">
                          Amount
                        </th>

                        <th className="px-6 py-3 text-left font-medium">
                          Due Date
                        </th>

                        <th className="px-6 py-3 text-left font-medium">
                          Status
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {recentInvoices.map((invoice) => (
                        <tr
                          key={invoice._id}
                          className="border-b border-gray-50 hover:bg-gray-50"
                        >

                          <td className="px-6 py-4 font-medium text-amber-700">
                            {invoice.invoiceNumber}
                          </td>

                          <td className="px-6 py-4 text-gray-600">
                            {invoice.client?.name || "—"}
                          </td>

                          <td className="px-6 py-4 font-medium text-gray-900">
                            ₹{invoice.total.toLocaleString()}
                          </td>

                          <td className="px-6 py-4 text-gray-500">
                            {new Date(
                              invoice.dueDate
                            ).toLocaleDateString()}
                          </td>

                          <td className="px-6 py-4">

                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(
                                invoice.status
                              )}`}
                            >
                              {invoice.status}
                            </span>

                          </td>

                        </tr>
                      ))}

                    </tbody>

                  </table>

                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-gray-100">

                  {recentInvoices.map((invoice) => (
                    <div
                      key={invoice._id}
                      className="p-4"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <p className="font-semibold text-amber-700 text-sm">
                            {invoice.invoiceNumber}
                          </p>

                          <p className="text-sm text-gray-700 mt-1 truncate">
                            {invoice.client?.name || "—"}
                          </p>

                        </div>

                        <span
                          className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${statusColor(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>

                      </div>

                      <div className="flex items-center justify-between mt-4">

                        <div>
                          <p className="text-xs text-gray-400">
                            Amount
                          </p>

                          <p className="text-sm font-semibold text-gray-900 mt-0.5">
                            ₹{invoice.total.toLocaleString()}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-400">
                            Due Date
                          </p>

                          <p className="text-sm text-gray-600 mt-0.5">
                            {new Date(
                              invoice.dueDate
                            ).toLocaleDateString()}
                          </p>
                        </div>

                      </div>

                    </div>
                  ))}

                </div>

                {/* Empty State */}
                {recentInvoices.length === 0 && (
                  <div className="px-6 py-12 text-center">

                    <p className="text-gray-400 text-sm">
                      No invoices yet.
                    </p>

                    <Link
                      to="/invoices/create"
                      className="inline-block mt-2 text-amber-700 text-sm font-medium hover:underline"
                    >
                      Create your first invoice
                    </Link>

                  </div>
                )}

              </div>

            </>
          )}

        </div>

      </main>

    </div>
  )
}

