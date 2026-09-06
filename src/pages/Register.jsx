import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../context/AuthContext"

const API = import.meta.env.VITE_API_URL

export default function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  })

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError("")

    try {
      const res = await axios.post(`${API}/api/auth/register`, formData)

      login(res.data.data)
      navigate("/dashboard")
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4 py-8 sm:px-6">
      <div className="w-full max-w-md">
        {/* Register Card */}
        <div className="bg-white border border-amber-100 rounded-2xl shadow-sm p-6 sm:p-8">
          {/* Header */}
          <div className="text-center mb-7 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-900">
              Brew Invoice
            </h1>

            <p className="text-gray-500 text-sm mt-2">
              Create your account
            </p>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg mb-5">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Full name
              </label>

              <input
                id="name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Sivasankaran"
                autoComplete="name"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="siva@example.com"
                autoComplete="email"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1.5"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Min 8 characters"
                autoComplete="new-password"
                minLength={8}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-700 hover:bg-amber-800 text-white font-medium py-3 rounded-lg text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          {/* Login */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-amber-700 font-medium hover:text-amber-800 hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-5">
          Simple invoicing for your business
        </p>
      </div>
    </div>
  )
}