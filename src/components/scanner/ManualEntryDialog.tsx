import { useState } from "react"
import { useTranslation } from "react-i18next"

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
  const { t } = useTranslation()
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
          {t("scanner.manual.trigger")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("scanner.manual.title")}</DialogTitle>
          <DialogDescription>{t("scanner.manual.description")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="manual">{t("scanner.manual.label")}</Label>
          <Input
            id="manual"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={t("scanner.manual.placeholder")}
            autoComplete="off"
          />
        </div>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            {t("common.close")}
          </Button>
          <Button
            type="button"
            disabled={!value.trim()}
            onClick={() => {
              onSubmitPayload(value.trim())
              setOpen(false)
              setValue("")
            }}
          >
            {t("scanner.manual.validate")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
