import { baseApi } from "@/shared/api/baseApi"
import { parseWithSchema } from "@/shared/lib/parseWithSchema"
import { messageResponseSchema } from "@/shared/schemas/common"
import {
  loginRequestSchema,
  loginResponseSchema,
  type LoginRequest,
  type LoginResponse,
  refreshTokenResponseSchema,
  type RefreshTokenResponse,
} from "@/shared/schemas/auth"

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body: loginRequestSchema.parse(body),
      }),
      transformResponse: (response: unknown) =>
        parseWithSchema(loginResponseSchema, response, "login"),
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
        body: {},
      }),
      transformResponse: (response: unknown) =>
        parseWithSchema(messageResponseSchema, response, "logout"),
    }),
    refreshToken: builder.mutation<RefreshTokenResponse, void>({
      query: () => ({
        url: "/auth/refresh",
        method: "POST",
        body: {},
      }),
      transformResponse: (response: unknown) =>
        parseWithSchema(refreshTokenResponseSchema, response, "refreshToken"),
    }),
  }),
})

export const { useLoginMutation, useLogoutMutation, useRefreshTokenMutation } = authApi
