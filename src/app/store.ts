import { configureStore } from "@reduxjs/toolkit"

import { authSlice } from "@/features/auth/authSlice"
import { baseApi } from "@/shared/api/baseApi"

import "@/features/auth/authApi"
import "@/features/scanner/scannerApi"

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
