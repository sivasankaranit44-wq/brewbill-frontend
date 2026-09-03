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

  const headers = { Authorization: `Bearer ${user?.token}` }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, invoicesRes] = await Promise.all([
          axios.get(`${API}/api/invoices/stats`, { headers }),
          axios.get(`${API}/api/invoices?limit=5`, { headers }),
        ])
        setStats(statsRes.data.data)
        setRecentInvoices(invoicesRes.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

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

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.name}!</p>
          </div>
          <Link
            to="/invoices/create"
            className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
          >
            + New Invoice
          </Link>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              {[
                { label: "Total Invoices", value: stats?.totalInvoices || 0, color: "text-gray-900" },
                { label: "Paid", value: stats?.paidInvoices || 0, color: "text-green-600" },
                { label: "Pending", value: stats?.pendingInvoices || 0, color: "text-blue-600" },
                { label: "Overdue", value: stats?.overdueInvoices || 0, color: "text-red-600" },
                { label: "Total Revenue", value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, color: "text-green-600" },
                { label: "Pending Amount", value: `₹${(stats?.pendingAmount || 0).toLocaleString()}`, color: "text-amber-600" },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
                  <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recent Invoices */}
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-semibold text-gray-900">Recent Invoices</h2>
                <Link to="/invoices" className="text-amber-700 text-sm hover:underline">
                  View all
                </Link>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-400 border-b border-gray-100">
                    <th className="px-6 py-3 text-left">Invoice</th>
                    <th className="px-6 py-3 text-left">Client</th>
                    <th className="px-6 py-3 text-left">Amount</th>
                    <th className="px-6 py-3 text-left">Due Date</th>
                    <th className="px-6 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice._id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="px-6 py-3 font-medium text-amber-700">{invoice.invoiceNumber}</td>
                      <td className="px-6 py-3 text-gray-600">{invoice.client?.name || "—"}</td>
                      <td className="px-6 py-3 font-medium">₹{invoice.total.toLocaleString()}</td>
                      <td className="px-6 py-3 text-gray-500">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor(invoice.status)}`}>
                          {invoice.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentInvoices.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                        No invoices yet. Create your first invoice!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

      </div>
    </div>
  )
}