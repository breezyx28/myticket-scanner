import { useState } from "react"
import { useTranslation } from "react-i18next"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getReleaseIconUrl, isAndroidMobileWeb, isNativePlatform } from "@/platform/detect"
import { downloadVerifiedApk } from "@/platform/verifyApkDownload"

const DISMISS_KEY = "myticket-scanner-install-dismissed"

function shouldShowInstallPrompt(): boolean {
  if (!isAndroidMobileWeb() || isNativePlatform()) return false
  try {
    return localStorage.getItem(DISMISS_KEY) !== "1"
  } catch {
    return false
  }
}

export function NativeInstallPrompt() {
  const { t } = useTranslation()
  const [open, setOpen] = useState(shouldShowInstallPrompt)
  const [downloading, setDownloading] = useState(false)

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, "1")
    } catch {
      /* private browsing */
    }
    setOpen(false)
  }

  const handleDownload = async () => {
    setDownloading(true)
    try {
      const result = await downloadVerifiedApk()
      if (result.ok) return
      if (result.reason === "integrity") {
        toast.error(t("native.install.integrityFailed"))
        return
      }
      toast.error(t("native.install.downloadFailed"))
    } finally {
      setDownloading(false)
    }
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={(next) => !next && dismiss()}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <img
              src={getReleaseIconUrl()}
              alt=""
              width={48}
              height={48}
              className="size-12 shrink-0 rounded-2xl border border-ink-10"
            />
            <div className="min-w-0 space-y-1">
              <DialogTitle>{t("native.install.title")}</DialogTitle>
              <p className="text-sm font-semibold text-ink">{t("common.appName")}</p>
            </div>
          </div>
          <DialogDescription className="pt-2">{t("native.install.description")}</DialogDescription>
        </DialogHeader>
        <p className="text-sm text-ink-60">{t("native.install.steps")}</p>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={dismiss} disabled={downloading}>
            {t("native.install.dismiss")}
          </Button>
          <Button type="button" disabled={downloading} onClick={() => void handleDownload()}>
            {downloading ? t("native.install.verifying") : t("native.install.download")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
