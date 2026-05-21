import { Navigate, Outlet, Route, Routes } from "react-router-dom"

import { useAppSelector } from "@/app/hooks"
import { selectIsAuthenticated } from "@/features/auth/authSlice"
import { LoginPage } from "@/pages/LoginPage"
import { ScannerPage } from "@/pages/ScannerPage"

function RequireAuth() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<ScannerPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
