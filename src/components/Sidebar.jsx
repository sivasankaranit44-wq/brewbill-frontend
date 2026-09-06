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

  const closeMenu = () => {
    setOpen(false)
  }

  const handleLogout = () => {
    closeMenu()
    logout()
  }

  return (
    <>
      {/* ================= MOBILE TOP BAR ================= */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-amber-900 z-[90] shadow-md">
        <div className="h-full flex items-center justify-between px-4 sm:px-5">

          <div className="min-w-0">
            <h1 className="text-white font-bold text-lg leading-tight">
              Brew Invoice
            </h1>

            <p className="text-amber-300 text-xs truncate max-w-[180px]">
              {user?.name}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setOpen((prev) => !prev)}
            className="w-10 h-10 shrink-0 flex items-center justify-center text-white text-2xl rounded-lg hover:bg-amber-800 transition"
            aria-label="Toggle menu"
          >
            {open ? "✕" : "☰"}
          </button>

        </div>
      </header>

      {/* ================= MOBILE OVERLAY ================= */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-[80]"
          onClick={closeMenu}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`
          fixed
          top-0
          left-0
          bottom-0
          z-[100]
          w-64
          bg-amber-900
          flex
          flex-col
          shadow-xl
          transition-transform
          duration-300
          ease-in-out
          lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* ================= BRAND ================= */}
        <div className="h-20 shrink-0 px-6 flex flex-col justify-center border-b border-amber-800">

          <h1 className="text-white font-bold text-xl">
            Brew Invoice
          </h1>

          <p className="text-amber-300 text-xs mt-1 truncate">
            {user?.name}
          </p>

        </div>

        {/* ================= NAVIGATION ================= */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">

          {links.map((link) => {

            const active = location.pathname === link.path

            return (
              <Link
                key={link.name}
                to={link.path}
                onClick={closeMenu}
                className={`
                  flex
                  items-center
                  gap-3
                  w-full
                  px-4
                  py-3
                  rounded-lg
                  text-sm
                  font-medium
                  transition
                  ${
                    active
                      ? "bg-amber-700 text-white"
                      : "text-amber-200 hover:bg-amber-800 hover:text-white"
                  }
                `}
              >

                <span className="text-base shrink-0">
                  {link.icon}
                </span>

                <span>
                  {link.name}
                </span>

              </Link>
            )
          })}

        </nav>

        {/* ================= BOTTOM ACTIONS ================= */}
        <div className="shrink-0 px-4 py-5 border-t border-amber-800">

          <Link
            to="/invoices/create"
            onClick={closeMenu}
            className="
              flex
              items-center
              justify-center
              w-full
              min-h-[44px]
              bg-amber-500
              hover:bg-amber-400
              text-amber-900
              font-semibold
              text-sm
              px-4
              py-3
              rounded-lg
              transition
            "
          >
            + New Invoice
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="
              block
              w-full
              min-h-[44px]
              text-center
              text-amber-300
              hover:text-white
              text-sm
              py-3
              mt-2
              rounded-lg
              hover:bg-amber-800
              transition
            "
          >
            Logout
          </button>

        </div>

      </aside>
    </>
  )
}