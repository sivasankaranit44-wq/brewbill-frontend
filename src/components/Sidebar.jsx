import { Link, useLocation } from "react-router-dom"
import { useState } from "react"
import { useAuth } from "../context/AuthContext"

const links = [
  { name: "Dashboard", path: "/dashboard", icon: "📊" },
  { name: "Invoices", path: "/invoices", icon: "🧾" },
  { name: "Clients", path: "/clients", icon: "👥" },
]

export default function Sidebar() {
  const location = useLocation()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-amber-900 flex items-center justify-between px-5 shadow-md">

        <div>
          <h1 className="text-white font-bold text-lg">
            Brew Invoice
          </h1>
          <p className="text-amber-300 text-xs">
            {user?.name}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="text-white text-2xl w-10 h-10 flex items-center justify-center"
          aria-label="Toggle menu"
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky
          top-0 left-0
          z-50 lg:z-auto
          h-screen
          w-64
          bg-amber-900
          flex flex-col
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >

        {/* Brand */}
        <div className="px-6 py-6 border-b border-amber-800">

          <h1 className="text-white font-bold text-xl">
            Brew Invoice
          </h1>

          <p className="text-amber-300 text-xs mt-1 truncate">
            {user?.name}
          </p>

        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">

          {links.map((link) => {
            const active =
              location.pathname === link.path

            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3
                  px-4 py-3
                  rounded-lg
                  text-sm font-medium
                  transition
                  ${
                    active
                      ? "bg-amber-700 text-white"
                      : "text-amber-200 hover:bg-amber-800 hover:text-white"
                  }
                `}
              >
                <span className="text-base">
                  {link.icon}
                </span>

                <span>
                  {link.name}
                </span>
              </Link>
            )
          })}

        </nav>

        {/* Bottom Actions */}
        <div className="px-4 py-5 border-t border-amber-800">

          <Link
            to="/invoices/create"
            onClick={() => setOpen(false)}
            className="block w-full text-center bg-amber-500 hover:bg-amber-400 text-amber-900 font-semibold text-sm py-3 rounded-lg transition"
          >
            + New Invoice
          </Link>

          <button
            onClick={logout}
            className="block w-full text-center text-amber-300 hover:text-white text-sm py-3 mt-2 transition"
          >
            Logout
          </button>

        </div>

      </aside>
    </>
  )
}
