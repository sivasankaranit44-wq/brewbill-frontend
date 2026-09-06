import { useEffect, useState } from "react"
import axios from "axios"
import { useAuth } from "../context/AuthContext"
import Sidebar from "../components/Sidebar"

const API = import.meta.env.VITE_API_URL

export default function Clients() {
  const { user } = useAuth()

  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editClient, setEditClient] = useState(null)

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    address: "",
    gstin: "",
  })

  const [error, setError] = useState("")

  const headers = {
    Authorization: `Bearer ${user?.token}`,
  }

  const fetchClients = async () => {
    try {
      const res = await axios.get(`${API}/api/clients`, { headers })
      setClients(res.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user?.token) return
    fetchClients()
  }, [user?.token])

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      company: "",
      address: "",
      gstin: "",
    })
  }

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")

    try {
      if (editClient) {
        await axios.put(
          `${API}/api/clients/${editClient._id}`,
          formData,
          { headers }
        )
      } else {
        await axios.post(
          `${API}/api/clients`,
          formData,
          { headers }
        )
      }

      setShowModal(false)
      setEditClient(null)
      resetForm()
      fetchClients()
    } catch (err) {
      setError(
        err.response?.data?.message || "Something went wrong"
      )
    }
  }

  const handleEdit = (client) => {
    setEditClient(client)

    setFormData({
      name: client.name || "",
      email: client.email || "",
      phone: client.phone || "",
      company: client.company || "",
      address: client.address || "",
      gstin: client.gstin || "",
    })

    setError("")
    setShowModal(true)
  }

  const handleAdd = () => {
    setEditClient(null)
    resetForm()
    setError("")
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this client?")) return

    try {
      await axios.delete(
        `${API}/api/clients/${id}`,
        { headers }
      )

      fetchClients()
    } catch (err) {
      console.error(err)
      alert("Failed to delete client")
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">

      <Sidebar />

      {/* Main Content */}
      <main className="lg:ml-64 min-h-screen pt-20 lg:pt-0">

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

          {/* Header */}
          <div className="relative z-10 flex flex-col gap-4 mb-6">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Clients
                </h1>

                <p className="text-gray-500 text-sm mt-1">
                  Manage your clients
                </p>
              </div>

              {/* Add Client Button */}
              <div className="w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleAdd}
                  className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center whitespace-nowrap bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-5 py-3 rounded-lg transition"
                >
                  + Add Client
                </button>
              </div>

            </div>

          </div>

          {/* Content */}
          {loading ? (

            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
              <p className="text-gray-400 text-sm">
                Loading clients...
              </p>
            </div>

          ) : clients.length === 0 ? (

            /* Empty State */
            <div className="bg-white rounded-xl border border-gray-200 p-8 sm:p-14 text-center">

              <h2 className="text-lg font-semibold text-gray-900">
                No clients yet
              </h2>

              <p className="text-sm text-gray-500 mt-2">
                Add your first client to get started.
              </p>

              <button
                type="button"
                onClick={handleAdd}
                className="mt-5 w-full sm:w-auto inline-flex items-center justify-center min-h-[44px] bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
              >
                + Add Client
              </button>

            </div>

          ) : (

            /* Clients Table */
            <div className="w-full bg-white rounded-xl border border-gray-200 overflow-hidden">

              {/* Horizontal Scroll */}
              <div className="w-full overflow-x-auto overscroll-x-contain">

                <table className="min-w-[760px] w-full text-sm">

                  <thead>
                    <tr className="text-gray-400 border-b border-gray-100">

                      <th className="px-4 sm:px-6 py-4 text-left font-medium whitespace-nowrap">
                        Name
                      </th>

                      <th className="px-4 sm:px-6 py-4 text-left font-medium whitespace-nowrap">
                        Email
                      </th>

                      <th className="px-4 sm:px-6 py-4 text-left font-medium whitespace-nowrap">
                        Phone
                      </th>

                      <th className="px-4 sm:px-6 py-4 text-left font-medium whitespace-nowrap">
                        Company
                      </th>

                      <th className="px-4 sm:px-6 py-4 text-left font-medium whitespace-nowrap">
                        Actions
                      </th>

                    </tr>
                  </thead>

                  <tbody>

                    {clients.map((client) => (

                      <tr
                        key={client._id}
                        className="border-b border-gray-50 last:border-0 hover:bg-gray-50 transition"
                      >

                        <td className="px-4 sm:px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                          {client.name}
                        </td>

                        <td className="px-4 sm:px-6 py-4 text-gray-500">
                          <span
                            className="block max-w-[220px] truncate"
                            title={client.email}
                          >
                            {client.email}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-4 text-gray-500 whitespace-nowrap">
                          {client.phone}
                        </td>

                        <td className="px-4 sm:px-6 py-4 text-gray-500">
                          <span
                            className="block max-w-[180px] truncate"
                            title={client.company}
                          >
                            {client.company}
                          </span>
                        </td>

                        <td className="px-4 sm:px-6 py-4">

                          <div className="flex items-center gap-4 whitespace-nowrap">

                            <button
                              type="button"
                              onClick={() => handleEdit(client)}
                              className="text-amber-600 hover:text-amber-800 text-xs font-medium"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(client._id)}
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

          )}

        </div>

      </main>

      {/* Modal */}
      {showModal && (

        <div className="fixed inset-0 z-[100] bg-black/50 flex items-start sm:items-center justify-center px-4 py-6 overflow-y-auto">

          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl my-auto max-h-[calc(100vh-3rem)] overflow-y-auto p-5 sm:p-6">

            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">

              <h2 className="font-bold text-lg text-gray-900">
                {editClient ? "Edit Client" : "Add Client"}
              </h2>

              <button
                type="button"
                onClick={() => {
                  setShowModal(false)
                  setError("")
                }}
                className="shrink-0 text-gray-400 hover:text-gray-600 text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>

            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-3 py-2.5 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4"
            >

              {[
                {
                  name: "name",
                  label: "Full Name",
                  placeholder: "Name",
                },
                {
                  name: "email",
                  label: "Email",
                  placeholder: "yourname@example.com",
                  type: "email",
                },
                {
                  name: "phone",
                  label: "Phone",
                  placeholder: "10 digit mobile number",
                  type: "tel",
                },
                {
                  name: "company",
                  label: "Company",
                  placeholder: "Your company's name",
                },
                {
                  name: "address",
                  label: "Address",
                  placeholder: "Chennai, Tamil Nadu",
                },
                {
                  name: "gstin",
                  label: "GSTIN (optional)",
                  placeholder: "33AAAAA0000A1Z5",
                },
              ].map((field) => (

                <div key={field.name}>

                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    {field.label}
                  </label>

                  <input
                    type={field.type || "text"}
                    name={field.name}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    className="w-full min-w-0 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />

                </div>

              ))}

              {/* Buttons */}
              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">

                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false)
                    setError("")
                  }}
                  className="w-full sm:flex-1 min-h-[44px] bg-gray-100 hover:bg-gray-200 text-sm py-2.5 rounded-lg transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="w-full sm:flex-1 min-h-[44px] bg-amber-700 hover:bg-amber-800 text-white text-sm py-2.5 rounded-lg transition"
                >
                  {editClient ? "Update" : "Add Client"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  )
}