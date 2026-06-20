import type { AppDispatch } from "@/app/store"

import { clearAuth } from "./authSlice"
import { clearBiometricLogin } from "./biometricAuth"
import { clearSessionAwaitable } from "./session"

export async function clearAuthSession(dispatch: AppDispatch): Promise<void> {
  await clearBiometricLogin()
  await clearSessionAwaitable()
  dispatch(clearAuth())
}
