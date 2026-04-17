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
import { buildQrPayload } from "@/mocks/parseScanPayload"
import { cn } from "@/lib/utils"

interface SimulateScanDialogProps {
  onSubmitPayload: (raw: string) => void
  /** Optional trigger styles (e.g. scanner toolbar) */
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
            Fire the same validation path as the camera. Pick a sample or paste a full QR payload.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-40">Samples</p>
          <div className="flex flex-col gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-auto min-h-[48px] justify-start whitespace-normal py-3 text-left"
              onClick={() => apply(buildQrPayload("tck-001", "alpha", "evt-summer-jazz"))}
            >
              Valid VIP — Summer Jazz (one-time)
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto min-h-[48px] justify-start whitespace-normal py-3 text-left"
              onClick={() => apply(buildQrPayload("tck-002", "bravo", "evt-summer-jazz"))}
            >
              Already used — Summer Jazz
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto min-h-[48px] justify-start whitespace-normal py-3 text-left"
              onClick={() => apply(buildQrPayload("tck-003", "charlie", "evt-indie-fest"))}
            >
              Valid lawn — Indie Open Air (multi-scan)
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto min-h-[48px] justify-start whitespace-normal py-3 text-left"
              onClick={() => apply(buildQrPayload("tck-expired", "delta", "evt-indie-fest"))}
            >
              Expired ticket — Indie Open Air
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto min-h-[48px] justify-start whitespace-normal py-3 text-left"
              onClick={() => apply(buildQrPayload("tck-001", "wrong", "evt-summer-jazz"))}
            >
              Wrong secret (failed)
            </Button>
            <Button
              type="button"
              variant="outline"
              className="h-auto min-h-[48px] justify-start whitespace-normal py-3 text-left"
              onClick={() => apply("myticket://t/unknown-ticket?s=x")}
            >
              Unknown ticket id
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="custom-payload">Custom payload</Label>
          <Input
            id="custom-payload"
            placeholder='e.g. myticket://t/tck-001?s=alpha&e=evt-summer-jazz'
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            disabled={!custom.trim()}
            onClick={() => apply(custom.trim())}
          >
            Validate custom
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
