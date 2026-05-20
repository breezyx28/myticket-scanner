import { baseApi } from "@/shared/api/baseApi"
import { parseWithSchema } from "@/shared/lib/parseWithSchema"
import {
  assignmentsResponseSchema,
  deviceRegisterRequestSchema,
  deviceResponseSchema,
  meResponseSchema,
  scanResponseSchema,
  createScanRequestSchema,
  type Assignment,
  type CreateScanRequest,
  type DeviceRegisterRequest,
  type ScanLog,
  type ScannerAccount,
  type ScannerDevice,
} from "@/shared/schemas/scanner"

export const scannerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query<ScannerAccount, void>({
      query: () => "/me",
      transformResponse: (response: unknown) =>
        parseWithSchema(meResponseSchema, response, "me").data,
      providesTags: ["Me"],
    }),
    getAssignments: builder.query<Assignment[], void>({
      query: () => "/assignments",
      transformResponse: (response: unknown) =>
        parseWithSchema(assignmentsResponseSchema, response, "assignments").data,
      providesTags: ["Assignments"],
    }),
    registerDevice: builder.mutation<ScannerDevice, DeviceRegisterRequest>({
      query: (body) => ({
        url: "/devices/register",
        method: "POST",
        body: deviceRegisterRequestSchema.parse(body),
      }),
      transformResponse: (response: unknown) =>
        parseWithSchema(deviceResponseSchema, response, "registerDevice").data,
      invalidatesTags: ["Me", "Device"],
    }),
    createScan: builder.mutation<ScanLog, CreateScanRequest>({
      query: (body) => ({
        url: "/scans",
        method: "POST",
        body: createScanRequestSchema.parse(body),
      }),
      transformResponse: (response: unknown) =>
        parseWithSchema(scanResponseSchema, response, "createScan").data,
    }),
  }),
})

export const {
  useGetMeQuery,
  useGetAssignmentsQuery,
  useRegisterDeviceMutation,
  useCreateScanMutation,
  useLazyGetMeQuery,
  useLazyGetAssignmentsQuery,
} = scannerApi
