import i18n from "@/i18n/config"
import { baseApi } from "@/shared/api/baseApi"
import { parseWithSchema } from "@/shared/lib/parseWithSchema"
import { messageResponseSchema } from "@/shared/schemas/common"
import {
  createLoginRequestSchema,
  loginResponseSchema,
  type LoginRequest,
  type LoginResponse,
  refreshTokenResponseSchema,
  type RefreshTokenResponse,
} from "@/shared/schemas/auth"
import {
  forgotPasswordRequestSchema,
  resetPasswordRequestSchema,
  type ForgotPasswordRequest,
  type ResetPasswordRequest,
} from "@/shared/schemas/passwordReset"

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body: createLoginRequestSchema(i18n.t).parse(body),
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
    forgotPassword: builder.mutation<{ message: string }, ForgotPasswordRequest>({
      query: (body) => ({
        url: "/auth/password/forgot",
        method: "POST",
        body: forgotPasswordRequestSchema.parse(body),
      }),
      transformResponse: (response: unknown) =>
        parseWithSchema(messageResponseSchema, response, "forgotPassword"),
    }),
    resetPassword: builder.mutation<{ message: string }, ResetPasswordRequest>({
      query: (body) => ({
        url: "/auth/password/reset",
        method: "POST",
        body: resetPasswordRequestSchema.parse(body),
      }),
      transformResponse: (response: unknown) =>
        parseWithSchema(messageResponseSchema, response, "resetPassword"),
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

export const {
  useLoginMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRefreshTokenMutation,
} = authApi
