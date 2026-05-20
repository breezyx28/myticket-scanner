import { cn } from "@/lib/utils"

interface CrossOrnamentProps {
  size?: number
  color?: string
  className?: string
}

export function CrossOrnament({
  size = 28,
  color = "currentColor",
  className,
}: CrossOrnamentProps) {
  const r = size * 0.1
  const arm = size * 0.28
  const center = size / 2

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect x={0} y={center - arm / 2} width={size} height={arm} rx={r} fill={color} />
      <rect x={center - arm / 2} y={0} width={arm} height={size} rx={r} fill={color} />
    </svg>
  )
}

export function CrossPattern({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)} aria-hidden>
      <CrossOrnament size={28} color="#FF6B4A" />
      <CrossOrnament size={28} color="#3355FF" />
      <CrossOrnament size={28} color="#F5E642" />
    </div>
  )
}
