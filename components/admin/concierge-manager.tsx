"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import Image from "next/image"
import { experiences, type Experience, type ExperienceType } from "@/lib/experiences"
import { cn } from "@/lib/utils"
import type { SiteConfig, ConciergeOverride, ConciergeAddition } from "@/lib/site-config-store"
import {
  Eye,
  EyeOff,
  GripVertical,
  Pencil,
  Plus,
  X,
  Loader2,
  ArrowUp,
  ArrowDown,
  Trash2,
} from "lucide-react"
import { SaveIndicator } from "@/components/admin/save-indicator"

const EXPERIENCE_TYPES: ExperienceType[] = [
  "dining",
  "wellness",
  "boating",
  "entertainment",
  "lifestyle",
  "childcare",
]

/* ── Component ────────────────────────────────────── */

export function ConciergeManager() {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [filterType, setFilterType] = useState<string>("all")
  const [editingPartner, setEditingPartner] = useState<(Experience & { isAddition?: boolean }) | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const saveTimeout = useRef<NodeJS.Timeout>(undefined)

  useEffect(() => {
    fetch("/api/site-config")
      .then((r) => r.json())
      .then((data) => setConfig(data))
      .catch(() => {})
  }, [])

  const saveConfig = useCallback(
    async (updatedConfig: SiteConfig, logAction?: string) => {
      setSaveStatus("saving")
      try {
        await fetch("/api/site-config", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ config: updatedConfig, logAction }),
        })
        try {
          localStorage.setItem("site-config-updated", Date.now().toString())
        } catch {}
        setSaveStatus("saved")
        clearTimeout(saveTimeout.current)
        saveTimeout.current = setTimeout(() => setSaveStatus("idle"), 2000)
      } catch {
        setSaveStatus("idle")
      }
    },
    []
  )

  // Build merged list: base experiences + additions, with overrides applied
  const getMergedList = useCallback((): (Experience & { isAddition?: boolean; isHidden?: boolean })[] => {
    if (!config) return experiences.map((e) => ({ ...e }))

    const additions = (config.conciergeAdditions || []).map((a) => ({
      ...a,
      images: [],
      isAddition: true,
    })) as (Experience & { isAddition: boolean })[]

    const allPartners = [...experiences, ...additions]

    // Apply order if set
    const order = config.conciergeOrder
    let ordered: typeof allPartners
    if (order && order.length > 0) {
      const inOrder = order
        .map((id) => allPartners.find((p) => p.id === id))
        .filter(Boolean) as typeof allPartners
      const notInOrder = allPartners.filter((p) => !order.includes(p.id))
      ordered = [...inOrder, ...notInOrder]
    } else {
      ordered = allPartners
    }

    // Apply overrides
    return ordered.map((partner) => {
      const override = config.conciergeOverrides[partner.id]
      if (!override) return { ...partner, isHidden: false }
      return {
        ...partner,
        name: override.name ?? partner.name,
        type: (override.type ?? partner.type) as ExperienceType,
        description: override.description ?? partner.description,
        isHidden: override.hidden ?? false,
      }
    })
  }, [config])

  const mergedList = getMergedList()
  const filteredList =
    filterType === "all" ? mergedList : mergedList.filter((p) => p.type === filterType)

  function toggleVisibility(partnerId: string) {
    if (!config) return
    const current = config.conciergeOverrides[partnerId]?.hidden ?? false
    const partner = mergedList.find((p) => p.id === partnerId)
    const updated: SiteConfig = {
      ...config,
      conciergeOverrides: {
        ...config.conciergeOverrides,
        [partnerId]: {
          ...config.conciergeOverrides[partnerId],
          hidden: !current,
        },
      },
    }
    setConfig(updated)
    saveConfig(updated, `${partner?.name || partnerId} ${current ? "shown" : "hidden"} in concierge directory`)
  }

  function movePartner(index: number, direction: -1 | 1) {
    const currentOrder =
      config?.conciergeOrder?.length
        ? [...config.conciergeOrder]
        : mergedList.map((p) => p.id)
    const newIndex = index + direction
    if (newIndex < 0 || newIndex >= currentOrder.length) return
    ;[currentOrder[index], currentOrder[newIndex]] = [currentOrder[newIndex], currentOrder[index]]
    const updated: SiteConfig = { ...config!, conciergeOrder: currentOrder }
    setConfig(updated)
    saveConfig(updated, "Concierge partner order updated")
  }

  function savePartnerEdit(partnerId: string, fields: Partial<ConciergeOverride>, isAddition?: boolean) {
    if (!config) return

    if (isAddition) {
      // Update the addition directly
      const additions = [...(config.conciergeAdditions || [])]
      const idx = additions.findIndex((a) => a.id === partnerId)
      if (idx >= 0) {
        additions[idx] = { ...additions[idx], ...fields } as ConciergeAddition
      }
      const updated: SiteConfig = { ...config, conciergeAdditions: additions }
      setConfig(updated)
      saveConfig(updated, `Concierge partner "${fields.name || partnerId}" updated`)
    } else {
      // Store as override
      const updated: SiteConfig = {
        ...config,
        conciergeOverrides: {
          ...config.conciergeOverrides,
          [partnerId]: {
            ...config.conciergeOverrides[partnerId],
            ...fields,
          },
        },
      }
      setConfig(updated)
      saveConfig(updated, `Concierge partner "${fields.name || partnerId}" updated`)
    }
    setEditingPartner(null)
  }

  function addNewPartner(partner: ConciergeAddition) {
    if (!config) return
    const updated: SiteConfig = {
      ...config,
      conciergeAdditions: [...(config.conciergeAdditions || []), partner],
      conciergeOrder: [
        ...(config.conciergeOrder?.length ? config.conciergeOrder : mergedList.map((p) => p.id)),
        partner.id,
      ],
    }
    setConfig(updated)
    saveConfig(updated, `New concierge partner "${partner.name}" added`)
    setShowAddModal(false)
  }

  function deleteAddition(partnerId: string) {
    if (!config) return
    const partner = mergedList.find((p) => p.id === partnerId)
    const updated: SiteConfig = {
      ...config,
      conciergeAdditions: (config.conciergeAdditions || []).filter((a) => a.id !== partnerId),
      conciergeOrder: (config.conciergeOrder || []).filter((id) => id !== partnerId),
    }
    setConfig(updated)
    saveConfig(updated, `Concierge partner "${partner?.name || partnerId}" deleted`)
  }

  if (!config) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-[#9D5F36]" />
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* Header actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#1C1C1C] text-[#ECE9E7] border border-white/10 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-[#9D5F36]/50"
          >
            <option value="all">All Types</option>
            {EXPERIENCE_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>

          <SaveIndicator status={saveStatus} />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#9D5F36] hover:bg-[#9D5F36]/80 text-white rounded-xl text-sm font-medium transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Partner
        </button>
      </div>

      {/* Partner list */}
      <div className="space-y-1">
        {filteredList.map((partner, index) => (
          <div
            key={partner.id}
            className={cn(
              "flex items-center gap-3 px-4 py-3 bg-[#1C1C1C] rounded-xl border border-white/5 transition-colors",
              partner.isHidden && "opacity-40"
            )}
          >
            <GripVertical className="h-4 w-4 text-[#ECE9E7]/20 flex-shrink-0 cursor-grab" />

            {/* Thumbnail */}
            <div className="w-10 h-10 rounded-lg bg-[#2B2B2B] overflow-hidden flex-shrink-0">
              {partner.imageUrl && (
                <Image
                  src={partner.imageUrl}
                  alt={partner.name}
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="text-sm text-[#ECE9E7] truncate">{partner.name}</div>
              <div className="text-[11px] text-[#BCA28A]/60 capitalize">{partner.type}</div>
            </div>

            {/* Type badge */}
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-white/5 text-[10px] text-[#ECE9E7]/30 uppercase tracking-wider">
              {partner.type}
            </span>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => movePartner(index, -1)}
                disabled={index === 0}
                className="p-1 rounded text-[#ECE9E7]/20 hover:text-[#ECE9E7]/60 disabled:opacity-20"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => movePartner(index, 1)}
                disabled={index === filteredList.length - 1}
                className="p-1 rounded text-[#ECE9E7]/20 hover:text-[#ECE9E7]/60 disabled:opacity-20"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => toggleVisibility(partner.id)}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  partner.isHidden
                    ? "text-[#ECE9E7]/20 hover:text-[#ECE9E7]/50"
                    : "text-emerald-400/60 hover:text-emerald-400"
                )}
              >
                {partner.isHidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => setEditingPartner(partner)}
                className="p-1.5 rounded-lg text-[#ECE9E7]/20 hover:text-[#9D5F36] transition-colors"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              {partner.isAddition && (
                <button
                  onClick={() => deleteAddition(partner.id)}
                  className="p-1.5 rounded-lg text-[#ECE9E7]/20 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {editingPartner && (
        <PartnerEditModal
          partner={editingPartner}
          onSave={(fields) =>
            savePartnerEdit(editingPartner.id, fields, editingPartner.isAddition)
          }
          onClose={() => setEditingPartner(null)}
        />
      )}

      {/* Add Modal */}
      {showAddModal && (
        <PartnerAddModal
          onAdd={addNewPartner}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}

/* ── Edit Modal ───────────────────────────────────── */

function PartnerEditModal({
  partner,
  onSave,
  onClose,
}: {
  partner: Experience
  onSave: (fields: Partial<ConciergeOverride>) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    name: partner.name,
    type: partner.type,
    description: partner.description,
    details: partner.details,
    contactName: partner.contactName || "",
    contactTitle: partner.contactTitle || "",
    phone: partner.phone || "",
    email: partner.email || "",
    website: partner.website || "",
    serviceOffered: partner.serviceOffered || "",
    imageUrl: partner.imageUrl || "",
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-[#1C1C1C] rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#ECE9E7] font-serif text-lg">Edit Partner</h3>
          <button onClick={onClose} className="text-[#ECE9E7]/30 hover:text-[#ECE9E7]/60">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <FormField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <div>
            <label className="block text-[#ECE9E7]/40 text-xs uppercase tracking-wider mb-1.5">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as ExperienceType })}
              className="w-full bg-[#2B2B2B] text-[#ECE9E7] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#9D5F36]/50"
            >
              {EXPERIENCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <FormField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline />
          <FormField label="Details" value={form.details} onChange={(v) => setForm({ ...form, details: v })} multiline />
          <FormField label="Contact Name" value={form.contactName} onChange={(v) => setForm({ ...form, contactName: v })} />
          <FormField label="Contact Title" value={form.contactTitle} onChange={(v) => setForm({ ...form, contactTitle: v })} />
          <FormField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <FormField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <FormField label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} />
          <FormField label="Service Offered" value={form.serviceOffered} onChange={(v) => setForm({ ...form, serviceOffered: v })} />
          <FormField label="Image URL" value={form.imageUrl} onChange={(v) => setForm({ ...form, imageUrl: v })} />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-white/10 text-[#ECE9E7]/50 rounded-xl text-sm hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            className="flex-1 px-4 py-2.5 bg-[#9D5F36] hover:bg-[#9D5F36]/80 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Add Modal ────────────────────────────────────── */

function PartnerAddModal({
  onAdd,
  onClose,
}: {
  onAdd: (partner: ConciergeAddition) => void
  onClose: () => void
}) {
  const [form, setForm] = useState({
    name: "",
    type: "dining" as ExperienceType,
    description: "",
    details: "",
    contactName: "",
    contactTitle: "",
    phone: "",
    email: "",
    website: "",
    serviceOffered: "",
    imageUrl: "",
  })

  function handleAdd() {
    if (!form.name.trim()) return
    onAdd({
      id: form.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(),
      ...form,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto bg-[#1C1C1C] rounded-2xl border border-white/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#ECE9E7] font-serif text-lg">Add Partner</h3>
          <button onClick={onClose} className="text-[#ECE9E7]/30 hover:text-[#ECE9E7]/60">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <FormField label="Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} required />
          <div>
            <label className="block text-[#ECE9E7]/40 text-xs uppercase tracking-wider mb-1.5">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as ExperienceType })}
              className="w-full bg-[#2B2B2B] text-[#ECE9E7] border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#9D5F36]/50"
            >
              {EXPERIENCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
          </div>
          <FormField label="Description" value={form.description} onChange={(v) => setForm({ ...form, description: v })} multiline required />
          <FormField label="Details" value={form.details} onChange={(v) => setForm({ ...form, details: v })} multiline />
          <FormField label="Contact Name" value={form.contactName} onChange={(v) => setForm({ ...form, contactName: v })} />
          <FormField label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <FormField label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <FormField label="Website" value={form.website} onChange={(v) => setForm({ ...form, website: v })} />
          <FormField label="Service Offered" value={form.serviceOffered} onChange={(v) => setForm({ ...form, serviceOffered: v })} />
          <FormField label="Image URL" value={form.imageUrl} onChange={(v) => setForm({ ...form, imageUrl: v })} />
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-white/10 text-[#ECE9E7]/50 rounded-xl text-sm hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!form.name.trim() || !form.description.trim()}
            className="flex-1 px-4 py-2.5 bg-[#9D5F36] hover:bg-[#9D5F36]/80 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-30"
          >
            Add Partner
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Form field helper ────────────────────────────── */

function FormField({
  label,
  value,
  onChange,
  multiline,
  required,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  multiline?: boolean
  required?: boolean
}) {
  const className =
    "w-full bg-[#2B2B2B] text-[#ECE9E7] border border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder:text-[#ECE9E7]/20 focus:outline-none focus:border-[#9D5F36]/50"

  return (
    <div>
      <label className="block text-[#ECE9E7]/40 text-xs uppercase tracking-wider mb-1.5">
        {label}
        {required && <span className="text-[#9D5F36] ml-1">*</span>}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className={cn(className, "resize-none")}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={className}
        />
      )}
    </div>
  )
}
