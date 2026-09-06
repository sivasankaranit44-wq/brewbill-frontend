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
    name: "", email: "", phone: "", company: "", address: "", gstin: ""
  })
  const [error, setError] = useState("")

  const headers = { Authorization: `Bearer ${user?.token}` }

  const fetchClients = async () => {
    try {
      const res = await axios.get(`${API}/api/clients`, { headers })
      setClients(res.data.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchClients() }, [])

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    try {
      if (editClient) {
        await axios.put(`${API}/api/clients/${editClient._id}`, formData, { headers })
      } else {
        await axios.post(`${API}/api/clients`, formData, { headers })
      }
      setShowModal(false)
      setEditClient(null)
      setFormData({ name: "", email: "", phone: "", company: "", address: "", gstin: "" })
      fetchClients()
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong")
    }
  }

  const handleEdit = (client) => {
    setEditClient(client)
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      address: client.address,
      gstin: client.gstin,
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this client?")) return
    await axios.delete(`${API}/api/clients/${id}`, { headers })
    fetchClients()
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 p-8">

        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <button
            onClick={() => { setEditClient(null); setFormData({ name: "", email: "", phone: "", company: "", address: "", gstin: "" }); setShowModal(true) }}
            className="bg-amber-700 hover:bg-amber-800 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition"
          >
            + Add Client
          </button>
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">Loading...</div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gray-400 border-b border-gray-100">
                  <th className="px-6 py-3 text-left">Name</th>
                  <th className="px-6 py-3 text-left">Email</th>
                  <th className="px-6 py-3 text-left">Phone</th>
                  <th className="px-6 py-3 text-left">Company</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr key={client._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium">{client.name}</td>
                    <td className="px-6 py-3 text-gray-500">{client.email}</td>
                    <td className="px-6 py-3 text-gray-500">{client.phone}</td>
                    <td className="px-6 py-3 text-gray-500">{client.company}</td>
                    <td className="px-6 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(client)} className="text-amber-600 hover:text-amber-800 text-xs font-medium">Edit</button>
                        <button onClick={() => handleDelete(client._id)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {clients.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400">
                      No clients yet. Add your first client!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg">{editClient ? "Edit Client" : "Add Client"}</h2>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                {[
                  { name: "name", label: "Full Name", placeholder: "Name" },
                  { name: "email", label: "Email", placeholder: "yourname@example.com" },
                  { name: "phone", label: "Phone", placeholder: "10 digit mobile number" },
                  { name: "company", label: "Company", placeholder: "Your company's name" },
                  { name: "address", label: "Address", placeholder: "Chennai, Tamil Nadu" },
                  { name: "gstin", label: "GSTIN (optional)", placeholder: "33AAAAA0000A1Z5" },
                ].map((field) => (
                  <div key={field.name}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{field.label}</label>
                    <input
                      name={field.name}
                      value={formData[field.name]}
                      onChange={handleChange}
                      placeholder={field.placeholder}
                      className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                ))}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-sm py-2.5 rounded-lg transition">
                    Cancel
                  </button>
                  <button type="submit"
                    className="flex-1 bg-amber-700 hover:bg-amber-800 text-white text-sm py-2.5 rounded-lg transition">
                    {editClient ? "Update" : "Add Client"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}