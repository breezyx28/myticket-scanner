import type { TFunction } from "i18next"

import type { Assignment } from "@/shared/schemas/scanner"

export function formatAssignmentLabel(assignment: Assignment, t: TFunction): string {
  const title = assignment.event?.title
  const code = assignment.event?.code
  if (title && code) return t("common.eventLabel", { title, code })
  if (title) return title
  if (code) return code
  return t("common.eventFallback", { id: assignment.event_id })
}
