import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ManualEntryDialogProps {
  onSubmitPayload: (raw: string) => void
  triggerClassName?: string
}

export function ManualEntryDialog({ onSubmitPayload, triggerClassName }: ManualEntryDialogProps) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("")

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "border-white/30 bg-white/10 text-white hover:bg-white/15",
            triggerClassName,
          )}
        >
          Manual entry
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enter ticket code</DialogTitle>
          <DialogDescription>
            Paste a ticket code (e.g. TIC-…) or the full QR JSON payload. Validation uses the live
            scanner API for the selected event.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="manual">Ticket code or payload</Label>
          <Input
            id="manual"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder='TIC-… or {"ticket_code":"TIC-…"}'
            autoComplete="off"
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            disabled={!value.trim()}
            onClick={() => {
              onSubmitPayload(value.trim())
              setOpen(false)
              setValue("")
            }}
          >
            Validate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
