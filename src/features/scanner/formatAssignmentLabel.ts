import type { Assignment } from "@/shared/schemas/scanner"

/** Display label for event picker — prefer code over placeholder titles from the API. */
export function formatAssignmentLabel(assignment: Assignment): string {
  const title = assignment.event?.title?.trim()
  const code = assignment.event?.code?.trim()

  if (code && (!title || /^test$/i.test(title))) {
    return code
  }
  if (code && title) {
    return `${title} · ${code}`
  }
  if (title) {
    return title
  }
  return `Event #${assignment.event_id}`
}
