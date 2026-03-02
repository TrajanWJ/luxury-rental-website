"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Loader2, Activity, Clock } from "lucide-react"

interface LogEntry {
  action: string
  timestamp: string
  user: string
}

export function ActivityLog() {
  const [entries, setEntries] = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/site-config?section=activityLog")
      .then((r) => r.json())
      .then((data) => {
        setEntries(data.activityLog || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#9D5F36]" />
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Activity className="h-12 w-12 text-[#ECE9E7]/10 mb-4" />
        <p className="text-[#ECE9E7]/30 text-sm">No activity recorded yet</p>
        <p className="text-[#ECE9E7]/15 text-xs mt-1">
          Actions will appear here as you make changes in the admin dashboard
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-1">
      {entries.map((entry, i) => {
        const date = new Date(entry.timestamp)
        const timeAgo = getTimeAgo(date)
        const isRecent = Date.now() - date.getTime() < 60 * 60 * 1000 // within 1 hour

        return (
          <div
            key={`${entry.timestamp}-${i}`}
            className="flex items-start gap-4 px-4 py-3 bg-[#1C1C1C] rounded-xl border border-white/5"
          >
            <div
              className={cn(
                "mt-0.5 w-2 h-2 rounded-full flex-shrink-0",
                isRecent ? "bg-[#9D5F36]" : "bg-white/10"
              )}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#ECE9E7]/80">{entry.action}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-[11px] text-[#ECE9E7]/25">{entry.user}</span>
                <span className="text-[11px] text-[#ECE9E7]/15 flex items-center gap-1">
                  <Clock className="h-2.5 w-2.5" />
                  {timeAgo}
                </span>
              </div>
            </div>
            <span className="text-[10px] text-[#ECE9E7]/15 whitespace-nowrap flex-shrink-0 mt-0.5">
              {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              {" "}
              {date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}
