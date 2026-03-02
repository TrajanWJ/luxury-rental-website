"use client"

import { ActivityLog } from "@/components/admin/activity-log"

export default function ActivityLogPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[#ECE9E7] font-serif text-3xl mb-1">Activity Log</h1>
        <p className="text-[#ECE9E7]/40 text-sm">
          Track all admin actions and changes across the dashboard
        </p>
      </div>
      <ActivityLog />
    </div>
  )
}
