import { Link, useLocation } from "react-router-dom"
import { useAuth } from "../context/AuthContext"

const links = [
  { name: "Dashboard", path: "/dashboard", icon: "📊" },
  { name: "Invoices", path: "/invoices", icon: "🧾" },
  { name: "Clients", path: "/clients", icon: "👥" },
]

export default function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()

  return (
    <div className="w-56 bg-amber-900 min-h-screen flex flex-col">

      {/* Brand */}
      <div className="px-6 py-6 border-b border-amber-800">
        <h1 className="text-white font-bold text-lg">Brew Invoice</h1>
        <p className="text-amber-300 text-xs mt-1">{user?.name}</p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.path}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
              location.pathname === link.path
                ? "bg-amber-700 text-white"
                : "text-amber-200 hover:bg-amber-800 hover:text-white"
            }`}
          >
            <span>{link.icon}</span>
            {link.name}
          </Link>
        ))}
      </nav>

      {/* Create Invoice Button */}
      <div className="px-3 py-4 border-t border-amber-800">
        <Link
          to="/invoices/create"
          className="block w-full text-center bg-amber-500 hover:bg-amber-400 text-amber-900 font-semibold text-sm py-2.5 rounded-lg transition"
        >
          + New Invoice
        </Link>
        <button
          onClick={logout}
          className="block w-full text-center text-amber-300 hover:text-white text-sm py-2.5 mt-2 transition"
        >
          Logout
        </button>
      </div>

    </div>
  )
}