import { zodResolver } from "@hookform/resolvers/zod"
import type { TFunction } from "i18next"
import { useEffect, useMemo } from "react"
import {
  useForm,
  type DefaultValues,
  type FieldValues,
  type Resolver,
  type UseFormReturn,
} from "react-hook-form"
import { useTranslation } from "react-i18next"
import type { z } from "zod"

export function useZodForm<T extends FieldValues>(
  schemaFactory: (t: TFunction) => z.ZodType<T, FieldValues>,
  options?: {
    defaultValues?: DefaultValues<T>
  },
): UseFormReturn<T> {
  const { t, i18n } = useTranslation()
  const schema = useMemo(() => schemaFactory(t), [schemaFactory, t])
  const resolver = useMemo(() => zodResolver(schema) as Resolver<T>, [schema])

  const form = useForm<T>({
    resolver,
    defaultValues: options?.defaultValues,
  })

  const { trigger, clearErrors, formState } = form
  const { isSubmitted, isDirty } = formState

  useEffect(() => {
    if (isSubmitted || isDirty) {
      void trigger()
    } else {
      clearErrors()
    }
    // Re-run only when locale changes; read latest dirty/submitted state from this render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: locale-only
  }, [i18n.language])

  return form
}
