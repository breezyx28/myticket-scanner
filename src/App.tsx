import { Navigate, Outlet, Route, Routes } from "react-router-dom"

import { useAppSelector } from "@/app/hooks"
import { NativeInstallPrompt } from "@/components/common/NativeInstallPrompt"
import { selectIsAuthenticated } from "@/features/auth/authSlice"
import { ForgotPasswordPage } from "@/pages/ForgotPasswordPage"
import { LoginPage } from "@/pages/LoginPage"
import { ResetPasswordNewPage } from "@/pages/ResetPasswordNewPage"
import { ResetPasswordVerifyPage } from "@/pages/ResetPasswordVerifyPage"
import { ScannerPage } from "@/pages/ScannerPage"
import { readPasswordResetSession } from "@/features/auth/passwordResetSession"

function ResetPasswordRedirect() {
  const session = readPasswordResetSession()
  if (session?.otp) return <Navigate to="/reset-password/new" replace />
  if (session?.email) return <Navigate to="/reset-password/verify" replace />
  return <Navigate to="/forgot-password" replace />
}

function RequireAuth() {
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <Outlet />
}

export default function App() {
  return (
    <>
      <NativeInstallPrompt />
      <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordRedirect />} />
      <Route path="/reset-password/verify" element={<ResetPasswordVerifyPage />} />
      <Route path="/reset-password/new" element={<ResetPasswordNewPage />} />
      <Route element={<RequireAuth />}>
        <Route path="/" element={<ScannerPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  )
}
