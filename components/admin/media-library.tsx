"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { ExperienceMediaManager } from "@/components/admin/experience-media-manager"
import { TrashGrid } from "@/components/admin/trash-grid"
import { UploadedGrid } from "@/components/admin/uploaded-grid"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function MediaLibrary() {
  const [experienceOpen, setExperienceOpen] = useState(false)
  const [uploadsOpen, setUploadsOpen] = useState(true)
  const [deletedOpen, setDeletedOpen] = useState(true)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[#ECE9E7] font-serif text-2xl lg:text-3xl mb-1">Media Library</h1>
        <p className="text-[#ECE9E7]/40 text-sm">
          Centralized uploads, experience images, and deleted-file recovery without the property listing controls mixed in.
        </p>
      </div>

      <div className="rounded-2xl border border-[#9D5F36]/20 bg-[#9D5F36]/[0.06] p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-[#ECE9E7] text-base font-medium">Need to edit a property gallery or tour link?</h2>
            <p className="text-[#ECE9E7]/40 text-sm mt-1">
              Go to Property Photos for listing-specific work like gallery order, video, 3D tour, and floor plans.
            </p>
          </div>
          <Link
            href="/admin/photos"
            className="inline-flex items-center justify-center rounded-xl border border-[#9D5F36]/35 px-4 py-2 text-sm font-medium text-[#D9B89F] hover:bg-[#9D5F36]/10"
          >
            Open Property Photos
          </Link>
        </div>
      </div>

      <Collapsible open={experienceOpen} onOpenChange={setExperienceOpen}>
        <section className="bg-[#141414] rounded-2xl border border-white/5 p-5 sm:p-6 space-y-5">
          <CollapsibleTrigger className="w-full text-left">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[#ECE9E7] font-serif text-xl">Concierge Media</h2>
                <p className="text-[#ECE9E7]/35 text-sm mt-1">
                  Assign and replace activity and concierge images used across the experiences pages and directory.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-[#ECE9E7]/60 hover:text-[#ECE9E7]/85">
                {experienceOpen ? "Hide" : "Show"}
                <ChevronDown className={`h-4 w-4 transition-transform ${experienceOpen ? "rotate-180" : ""}`} />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
            <div className="pt-2">
              <ExperienceMediaManager />
            </div>
          </CollapsibleContent>
        </section>
      </Collapsible>

      <Collapsible open={uploadsOpen} onOpenChange={setUploadsOpen}>
        <section className="bg-[#141414] rounded-2xl border border-white/5 p-5 sm:p-6 space-y-5">
          <CollapsibleTrigger className="w-full text-left">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[#ECE9E7] font-serif text-xl">Uploaded Library</h2>
                <p className="text-[#ECE9E7]/35 text-sm mt-1">
                  Browse all admin-uploaded files across properties, floor plans, and experience media.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-[#ECE9E7]/60 hover:text-[#ECE9E7]/85">
                {uploadsOpen ? "Hide" : "Show"}
                <ChevronDown className={`h-4 w-4 transition-transform ${uploadsOpen ? "rotate-180" : ""}`} />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
            <div className="pt-2">
              <UploadedGrid />
            </div>
          </CollapsibleContent>
        </section>
      </Collapsible>

      <Collapsible open={deletedOpen} onOpenChange={setDeletedOpen}>
        <section className="bg-[#141414] rounded-2xl border border-white/5 p-5 sm:p-6 space-y-5">
          <CollapsibleTrigger className="w-full text-left">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-[#ECE9E7] font-serif text-xl">Deleted Media</h2>
                <p className="text-[#ECE9E7]/35 text-sm mt-1">
                  Restore recently deleted items or permanently purge them after the 7-day recovery window.
                </p>
              </div>
              <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-[#ECE9E7]/60 hover:text-[#ECE9E7]/85">
                {deletedOpen ? "Hide" : "Show"}
                <ChevronDown className={`h-4 w-4 transition-transform ${deletedOpen ? "rotate-180" : ""}`} />
              </div>
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden">
            <div className="pt-2">
              <TrashGrid />
            </div>
          </CollapsibleContent>
        </section>
      </Collapsible>
    </div>
  )
}
