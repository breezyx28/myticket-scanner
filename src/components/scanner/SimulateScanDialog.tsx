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

interface SimulateScanDialogProps {
  onSubmitPayload: (raw: string) => void
  triggerClassName?: string
}

export function SimulateScanDialog({ onSubmitPayload, triggerClassName }: SimulateScanDialogProps) {
  const [open, setOpen] = useState(false)
  const [custom, setCustom] = useState("")

  const apply = (raw: string) => {
    onSubmitPayload(raw)
    setOpen(false)
    setCustom("")
  }

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
          Simulate scan
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90dvh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Simulate a scan</DialogTitle>
          <DialogDescription>
            Paste a ticket code (e.g. TIC-…) or full QR payload. Uses the same API path as the camera.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="custom-payload">Ticket code or payload</Label>
          <Input
            id="custom-payload"
            placeholder='e.g. TIC-6ZAZYTFABRQBUX or {"ticket_code":"TIC-…"}'
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            autoComplete="off"
          />
        </div>
        <DialogFooter className="flex-col gap-2 sm:flex-col">
          <Button
            type="button"
            variant="secondary"
            disabled={!custom.trim()}
            onClick={() => apply(custom.trim())}
          >
            Validate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
