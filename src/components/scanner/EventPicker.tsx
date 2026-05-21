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
  const dispatch = useAppDispatch()
  const assignments = useAppSelector(selectAssignments)
  const selectedEventId = useAppSelector(selectSelectedEventId)

  if (assignments.length === 0) return null

  const selectedAssignment = assignments.find((a) => a.event_id === selectedEventId)
  const selectedLabel = selectedAssignment
    ? formatAssignmentLabel(selectedAssignment)
    : undefined

  return (
    <Select
      value={selectedEventId != null ? String(selectedEventId) : undefined}
      onValueChange={(v) => dispatch(setSelectedEventId(Number.parseInt(v, 10)))}
    >
      <SelectTrigger
        aria-label="Select event"
        size="default"
        className="h-11 w-full min-w-0 max-w-full border-white/20 bg-white/10 text-left text-sm text-white data-placeholder:text-white/50 [&_svg]:shrink-0 [&_svg]:text-white/70"
      >
        <SelectValue placeholder="Event">{selectedLabel}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {assignments.map((a) => (
          <SelectItem key={a.id} value={String(a.event_id)}>
            <span className="truncate">{formatAssignmentLabel(a)}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
