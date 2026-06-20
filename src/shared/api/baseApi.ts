import {
  createApi,
  fetchBaseQuery,
  type BaseQueryFn,
  type FetchArgs,
  type FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react"

import { getApiBaseUrl } from "@/config/env"
import { clearAuthSession } from "@/features/auth/clearAuthSession"
import { selectToken } from "@/features/auth/authSlice"
import { getAcceptLanguageHeader } from "@/i18n/config"
import type { AppDispatch, RootState } from "@/app/store"

const rawBaseQuery = fetchBaseQuery({
  baseUrl: getApiBaseUrl(),
  prepareHeaders: (headers, { getState }) => {
    const token = selectToken(getState() as RootState)
    if (token) {
      headers.set("Authorization", `Bearer ${token}`)
    }
    headers.set("Accept", "application/json")
    headers.set("Accept-Language", getAcceptLanguageHeader())
    return headers
  },
})

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const result = await rawBaseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const url = typeof args === "string" ? args : args.url
    const isPublicAuth =
      url.includes("/auth/login") ||
      url.includes("/auth/password/forgot") ||
      url.includes("/auth/password/reset")
    if (!isPublicAuth) {
      void clearAuthSession(api.dispatch as AppDispatch)
    }
  }

  return result
}

export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Me", "Assignments", "Device"],
  endpoints: () => ({}),
})
