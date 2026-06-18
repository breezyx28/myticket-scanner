import { useTranslation } from "react-i18next"

import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  selectAssignments,
  selectSelectedEventId,
  setSelectedEventId,
} from "@/features/auth/authSlice"
import { formatAssignmentLabel } from "@/features/scanner/formatAssignmentLabel"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function EventPicker() {
  const { t } = useTranslation()
  const dispatch = useAppDispatch()
  const assignments = useAppSelector(selectAssignments)
  const selectedEventId = useAppSelector(selectSelectedEventId)

  if (assignments.length === 0) return null

  const selectedAssignment = assignments.find((a) => a.event_id === selectedEventId)
  const selectedLabel = selectedAssignment
    ? formatAssignmentLabel(selectedAssignment, t)
    : undefined

  return (
    <Select
      value={selectedEventId != null ? String(selectedEventId) : undefined}
      onValueChange={(v) => dispatch(setSelectedEventId(Number.parseInt(v, 10)))}
    >
      <SelectTrigger
        aria-label={t("scanner.event.selectAria")}
        size="default"
        className="h-11 w-full min-w-0 max-w-full border-white/20 bg-white/10 text-start text-sm text-white data-placeholder:text-white/50 [&_svg]:shrink-0 [&_svg]:text-white/70"
      >
        <SelectValue placeholder={t("scanner.event.placeholder")}>{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {assignments.map((a) => (
          <SelectItem key={a.id} value={String(a.event_id)}>
            <span className="truncate">{formatAssignmentLabel(a, t)}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
