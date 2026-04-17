import { useAuth } from "@/auth/AuthContext"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { MOCK_EVENTS } from "@/mocks/events"

export function EventPicker() {
  const { user, selectedEventId, setSelectedEventId } = useAuth()
  const options = MOCK_EVENTS.filter((e) => user?.assignedEventIds.includes(e.id))

  if (options.length === 0) return null

  return (
    <Select value={selectedEventId ?? undefined} onValueChange={setSelectedEventId}>
      <SelectTrigger
        aria-label="Select event"
        size="default"
        className="h-11 w-full min-w-0 max-w-full border-white/20 bg-white/10 text-left text-sm text-white data-placeholder:text-white/50 [&_svg]:shrink-0 [&_svg]:text-white/70"
      >
        <SelectValue placeholder="Event" />
      </SelectTrigger>
      <SelectContent>
        {options.map((e) => (
          <SelectItem key={e.id} value={e.id}>
            <span className="truncate">{e.name}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
