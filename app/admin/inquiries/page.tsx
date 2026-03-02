"use client"

import { InquiriesList } from "@/components/admin/inquiries-list"

export default function AdminInquiriesPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-[#ECE9E7] font-serif text-3xl mb-1">Inquiries</h1>
        <p className="text-[#ECE9E7]/40 text-sm">Contact form submissions from STR and real estate visitors</p>
      </div>
      <InquiriesList />
    </div>
  )
}
