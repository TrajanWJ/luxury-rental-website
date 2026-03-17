"use client"

import { useState, useEffect } from "react"
import { properties } from "@/lib/data"

const STORAGE_KEY = "admin-selected-property"

interface PropertySelectorProps {
  value?: string
  onChange?: (propertyId: string) => void
}

export function PropertySelector({ value, onChange }: PropertySelectorProps) {
  const [selectedId, setSelectedId] = useState(() => {
    if (value) return value
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) || properties[0]?.id || ""
    }
    return properties[0]?.id || ""
  })

  useEffect(() => {
    if (value !== undefined) setSelectedId(value)
  }, [value])

  function handleChange(id: string) {
    setSelectedId(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {}
    onChange?.(id)
  }

  return (
    <div className="flex-1">
      <label className="block text-[#ECE9E7]/40 text-[10px] uppercase tracking-wider mb-2">
        Select Property
      </label>
      <select
        value={selectedId}
        onChange={(e) => handleChange(e.target.value)}
        className="w-full bg-[#2B2B2B] text-[#ECE9E7] border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#9D5F36]/50"
      >
        {properties.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
      </select>
    </div>
  )
}

export function useSelectedProperty(initialId?: string) {
  const [selectedId, setSelectedId] = useState(() => {
    if (initialId) return initialId
    if (typeof window !== "undefined") {
      return localStorage.getItem(STORAGE_KEY) || properties[0]?.id || ""
    }
    return properties[0]?.id || ""
  })

  const selectedProperty =
    properties.find((p) => p.id === selectedId) || properties[0]

  function select(id: string) {
    setSelectedId(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {}
  }

  return { selectedId, selectedProperty, select }
}
