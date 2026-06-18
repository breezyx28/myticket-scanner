import { ArrowLeft, ArrowRight, type LucideProps } from "lucide-react"

import { cn } from "@/lib/utils"

export function ForwardArrow({ className, ...props }: LucideProps) {
  return <ArrowRight className={cn("rtl:rotate-180", className)} {...props} />
}

export function BackArrow({ className, ...props }: LucideProps) {
  return <ArrowLeft className={cn("rtl:rotate-180", className)} {...props} />
}
