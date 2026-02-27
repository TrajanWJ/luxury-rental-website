"use client"

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { Property } from "@/lib/data"

type ImageItem = { src: string; pos: number; locked: boolean }
type OrderMap = Record<string, ImageItem[]>

interface PhotoOrderContextValue {
  orders: OrderMap
  versions: Record<string, number>
  getOrderedImages: (property: Property) => string[]
  getHeroImage: (property: Property) => string
  saveOrder: (propertyKey: string, images: ImageItem[], version?: number) => Promise<boolean | "conflict">
  refreshNow: () => Promise<void>
}

const PhotoOrderContext = createContext<PhotoOrderContextValue | null>(null)

function toKey(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-")
}

const POLL_INTERVAL = 3000
const LS_PREFIX = "photo-order-"

export function PhotoOrderProvider({ children }: { children: React.ReactNode }) {
  const [orders, setOrders] = useState<OrderMap>({})
  const [versions, setVersions] = useState<Record<string, number>>({})
  const lastEtag = useRef("")

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch("/api/photo-order?property=_all", { cache: "no-store" })
      const data = await res.json()
      const etag = JSON.stringify(data)
      if (etag !== lastEtag.current) {
        lastEtag.current = etag
        if (data.orders) setOrders(data.orders)
      }
    } catch {}
  }, [])

  // Initial fetch
  useEffect(() => { fetchAll() }, [fetchAll])

  // Poll every 3 seconds
  useEffect(() => {
    const id = setInterval(fetchAll, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [fetchAll])

  // Cross-tab sync via localStorage
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key?.startsWith(LS_PREFIX) && e.newValue) {
        const propertyKey = e.key.slice(LS_PREFIX.length)
        try {
          const images = JSON.parse(e.newValue)
          setOrders(prev => ({ ...prev, [propertyKey]: images }))
        } catch {}
      }
    }
    window.addEventListener("storage", handler)
    return () => window.removeEventListener("storage", handler)
  }, [])

  const getOrderedImages = useCallback((property: Property): string[] => {
    const key = toKey(property.name)
    const saved = orders[key]
    if (saved && saved.length > 0) {
      return saved.map(item => item.src)
    }
    return property.images
  }, [orders])

  const getHeroImage = useCallback((property: Property): string => {
    const imgs = getOrderedImages(property)
    return imgs[0] || property.image
  }, [getOrderedImages])

  const saveOrder = useCallback(async (propertyKey: string, images: ImageItem[], version?: number): Promise<boolean | "conflict"> => {
    // Update local state instantly
    setOrders(prev => ({ ...prev, [propertyKey]: images }))
    // Save to localStorage (cross-tab sync)
    try { localStorage.setItem(LS_PREFIX + propertyKey, JSON.stringify(images)) } catch {}
    // Save to API (cross-browser persistence) and await confirmation
    try {
      const res = await fetch("/api/photo-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ property: propertyKey, images, ...(version !== undefined && { version }) }),
      })
      if (res.status === 409) {
        return "conflict"
      }
      return res.ok
    } catch {
      return false
    }
  }, [])

  return (
    <PhotoOrderContext.Provider value={{ orders, versions, getOrderedImages, getHeroImage, saveOrder, refreshNow: fetchAll }}>
      {children}
    </PhotoOrderContext.Provider>
  )
}

export function usePhotoOrder() {
  const ctx = useContext(PhotoOrderContext)
  if (!ctx) throw new Error("usePhotoOrder must be used within PhotoOrderProvider")
  return ctx
}
