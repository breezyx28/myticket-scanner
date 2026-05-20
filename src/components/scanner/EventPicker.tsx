import { useAppDispatch, useAppSelector } from "@/app/hooks"
import {
  selectAssignments,
  selectSelectedEventId,
  setSelectedEventId,
} from "@/features/auth/authSlice"
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
        <SelectValue placeholder="Event" />
      </SelectTrigger>
      <SelectContent>
        {assignments.map((a) => (
          <SelectItem key={a.id} value={String(a.event_id)}>
            <span className="truncate">{a.event?.title ?? `Event #${a.event_id}`}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
