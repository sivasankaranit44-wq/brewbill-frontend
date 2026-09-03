import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import ProtectedRoute from "./components/ProtectedRoute"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Dashboard from "./pages/Dashboard"
import Clients from "./pages/Clients"
import Invoices from "./pages/Invoices"
import CreateInvoice from "./pages/CreateInvoice"

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={
            <ProtectedRoute><Dashboard /></ProtectedRoute>
          } />
          <Route path="/clients" element={
            <ProtectedRoute><Clients /></ProtectedRoute>
          } />
          <Route path="/invoices" element={
            <ProtectedRoute><Invoices /></ProtectedRoute>
          } />
          <Route path="/invoices/create" element={
            <ProtectedRoute><CreateInvoice /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App