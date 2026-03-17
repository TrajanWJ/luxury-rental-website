"use client"

import { Check, Loader2 } from "lucide-react"

interface SaveIndicatorProps {
  status: "idle" | "saving" | "saved"
}

export function SaveIndicator({ status }: SaveIndicatorProps) {
  if (status === "idle") return null

  return (
    <div className="flex items-center gap-2 text-xs">
      {status === "saving" && (
        <>
          <Loader2 className="h-3 w-3 animate-spin text-[#BCA28A]" />
          <span className="text-[#BCA28A]">Saving...</span>
        </>
      )}
      {status === "saved" && (
        <>
          <Check className="h-3 w-3 text-emerald-400" />
          <span className="text-emerald-400">Saved</span>
        </>
      )}
    </div>
  )
}
